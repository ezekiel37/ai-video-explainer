import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { generateMockSceneGraph, contentToSceneGraph } from '@explainmotion/ai';
import { sceneGraphSchema } from '@explainmotion/schema';
import { layoutScene, CARD_HEIGHT, CARD_WIDTH } from '@explainmotion/layout';
import { byteRange, mediaResponse } from '../lib/server/media';
import { authConfiguration } from '../lib/server/auth-config';
import { useEditorStore } from '../lib/store';
const id = '4b83f3c8-95a6-4ed0-9e89-53edac5b28c4';
const graph = () => generateMockSceneGraph(id, 'Explain money transfer');

test('schema rejects duplicate IDs, missing references, late animations and videos over 90s', () => {
  assert.equal(sceneGraphSchema.safeParse(graph()).success, true);
  let value = graph(); value.scenes[0].nodes[1].id = value.scenes[0].nodes[0].id;
  assert.equal(sceneGraphSchema.safeParse(value).success, false);
  value = graph(); value.scenes[1].id = value.scenes[0].id;
  assert.equal(sceneGraphSchema.safeParse(value).success, false);
  value = graph(); value.scenes[0].edges[0].to = 'missing';
  assert.equal(sceneGraphSchema.safeParse(value).success, false);
  value = graph(); value.scenes[0].animations[0].startTimeSeconds = value.scenes[0].durationSeconds;
  assert.equal(sceneGraphSchema.safeParse(value).success, false);
  value = graph(); value.scenes = Array.from({length: 8}, (_, i) => ({ ...structuredClone(value.scenes[0]), id: `s${i}`, durationSeconds: 15 }));
  assert.equal(sceneGraphSchema.safeParse(value).success, false);
});

test('imports preserve all cross-scene relationships and end-prefixed identifiers', () => {
  const value = contentToSceneGraph(id, 'flowchart LR; endUser[User] --> n1 --> n2 --> n3 --> n4 --> n5 --> n6 --> n7 --> n8 --> n9');
  const edges = value.scenes.flatMap(scene => scene.edges);
  assert.equal(edges.length, 9);
  assert.ok(edges.some(edge => edge.from === 'n7' && edge.to === 'n8'));
  assert.equal(edges[0].from, 'endUser');
  assert.ok(value.scenes.every(scene => scene.nodes.length <= 8));
});

test('imports preserve outline overflow, quoted labels and reject unsupported or oversized diagrams', () => {
  const value = contentToSceneGraph(id, '# Test\n' + Array.from({length: 9}, (_, i) => `- Item ${i}`).join('\n'));
  assert.equal(value.scenes.flatMap(scene => scene.nodes).length, 9);
  assert.equal(value.scenes[1].nodes[0].metadata.sourceText, 'Item 8');
  assert.equal(contentToSceneGraph(id, '```mermaid\nflowchart TB\nA["one; two"] --> B\n```').scenes[0].nodes[0].label, 'one; two');
  assert.throws(() => contentToSceneGraph(id, 'flowchart LR\nsubgraph group\nA --> B\nend'), /Subgraphs/);
  assert.throws(() => contentToSceneGraph(id, Array.from({length: 9}, (_, i) => `# Section ${i}\n- Something useful`).join('\n')), /eight scenes/);
  assert.throws(() => contentToSceneGraph(id, 'flowchart LR\nA & B --> C'), /Unsupported/);
});

test('layouts keep dense cards separate before uniform scaling', () => {
  const value = contentToSceneGraph(id, 'flowchart LR; A --> B --> C --> D --> E --> F --> G --> H');
  for (const layout of ['horizontal-flow', 'step-sequence'] as const) {
    const nodes = layoutScene({...value.scenes[0], layout}, {width: 1184, height: 480}).nodes;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      assert.ok(Math.abs(nodes[i].x - nodes[j].x) >= CARD_WIDTH || Math.abs(nodes[i].y - nodes[j].y) >= CARD_HEIGHT);
    }
  }
});

test('production auth rejects missing, default and weak secrets', () => {
  for (const secret of [undefined, 'dev-secret-change-me', 'a'.repeat(64), 'development-only-secret-do-not-deploy']) {
    assert.throws(() => authConfiguration({NODE_ENV: 'production', BETTER_AUTH_SECRET: secret, BETTER_AUTH_URL: 'https://example.test'}));
  }
  assert.doesNotThrow(() => authConfiguration({NODE_ENV:'production', BETTER_AUTH_SECRET:'9fd23c18324ae0185539294f188ac3b724eba482f803906f8b8232bbfef0fa6178', BETTER_AUTH_URL:'https://example.test'}));
});

test('private media supports byte ranges, suffixes, downloads and missing files', async () => {
  assert.deepEqual(byteRange('bytes=-3', 10), {start:7,end:9});
  assert.deepEqual(byteRange('bytes=3-', 10), {start:3,end:9});
  for (const range of ['bytes=10-', 'bytes=-0', 'bytes=5-2', 'bytes=0-1,3-4']) assert.throws(() => byteRange(range,10));
  const folder = await mkdtemp(path.join(os.tmpdir(),'em-test-'));
  const previous = process.env.RENDER_OUTPUT_DIR; process.env.RENDER_OUTPUT_DIR = folder;
  try {
    await writeFile(path.join(folder,'abcdef.mp4'),'0123456789');
    const response = await mediaResponse('abcdef.mp4',new Request('http://localhost/file?download=1',{headers:{range:'bytes=2-5'}}));
    assert.equal(response.status,206); assert.equal(response.headers.get('content-range'),'bytes 2-5/10');
    assert.match(response.headers.get('content-disposition')!, /attachment/); assert.equal(await response.text(),'2345');
    const invalid = await mediaResponse('abcdef.mp4',new Request('http://localhost/file',{headers:{range:'bytes=99-'}}));
    assert.equal(invalid.status,416);
    await assert.rejects(mediaResponse('../abcdef.mp4',new Request('http://localhost/file')));
    await assert.rejects(mediaResponse('ffff.mp4',new Request('http://localhost/file')));
  } finally { if (previous === undefined) delete process.env.RENDER_OUTPUT_DIR; else process.env.RENDER_OUTPUT_DIR = previous; await rm(folder,{recursive:true,force:true}); }
});

test('editor keeps edits on failed save and never simulates completed output', async () => {
  const initial = useEditorStore.getState(); const originalFetch = globalThis.fetch;
  useEditorStore.setState({userId:'test-owner',projectId:id,version:1,dirty:true,sourceDirty:false,busy:false});
  globalThis.fetch = async () => new Response(JSON.stringify({message:'Version conflict'}),{status:409});
  try {
    assert.equal(await useEditorStore.getState().save(),false);
    assert.equal(useEditorStore.getState().dirty,true);
    assert.notEqual(useEditorStore.getState().render.status,'completed');
    assert.match(useEditorStore.getState().error!, /Version conflict/);
  } finally {globalThis.fetch=originalFetch; useEditorStore.setState(initial,true);}
});

test('discard restores the saved source and graph together', () => {
  const initial = useEditorStore.getState();
  useEditorStore.setState({savedGraph:graph(),savedSource:'Saved prompt text',savedSourceType:'prompt',source:'Changed source',sourceType:'import',dirty:true});
  useEditorStore.getState().discard();
  assert.equal(useEditorStore.getState().source,'Saved prompt text');
  assert.equal(useEditorStore.getState().sourceType,'prompt');
  assert.equal(useEditorStore.getState().dirty,false);
  useEditorStore.setState(initial,true);
});


test('session expiry preserves unsaved edits for the same account to recover', async () => {
  const initial = useEditorStore.getState();
  const edited = graph(); edited.title = 'Important unsaved edit';
  useEditorStore.setState({userId:'owner',lastUserId:'owner',graph:edited,dirty:true,projectId:id});
  await useEditorStore.getState().setSessionUser(null);
  assert.equal(useEditorStore.getState().graph.title,'Important unsaved edit');
  assert.equal(useEditorStore.getState().dirty,true);
  assert.equal(useEditorStore.getState().userId,null);
  assert.match(useEditorStore.getState().error!,/session ended/);
  useEditorStore.setState(initial,true);
});

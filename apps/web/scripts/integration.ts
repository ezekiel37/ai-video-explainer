/** Run against a migrated test database and web server, without a worker. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { generateMockSceneGraph } from '@explainmotion/ai';
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const pool = new pg.Pool({connectionString:process.env.DATABASE_URL});
const owners: string[] = [];
async function request(url: string, cookie = '', method = 'GET', body?: unknown) {
  return fetch(base + url, {method,headers:{'content-type':'application/json',origin:base,cookie},body:body === undefined ? undefined : JSON.stringify(body)});
}
async function account() {
  const result = await request('/api/auth/sign-up/email','','POST',{email:`review-${randomUUID()}@example.test`,password:randomUUID()+'A1!',name:'Integration test'});
  assert.equal(result.status,200,await result.clone().text());
  const data = await result.json(); owners.push(data.user.id);
  const cookie = result.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  assert.ok(cookie); return cookie;
}
async function main() {
  const alice = await account(), bob = await account();
  assert.equal((await request('/api/projects')).status,401);
  const created = await request('/api/projects',alice,'POST',{title:'Regression project',prompt:'Explain money transfer'});
  assert.equal(created.status,201); const project = await created.json();
  const graph = generateMockSceneGraph(project.id,'Explain money transfer');
  const saveBody = {version:1,sceneGraph:graph,prompt:'Explain money transfer',sourceType:'prompt'};
  assert.equal((await request(`/api/projects/${project.id}`,bob)).status,404);
  assert.equal((await request(`/api/projects/${project.id}/scene-graph`,bob,'PATCH',saveBody)).status,404);
  assert.equal((await request(`/api/projects/${project.id}/plan`,bob,'POST',{version:1,prompt:'Explain money transfer'})).status,404);
  assert.equal((await request(`/api/projects/${project.id}/import-mermaid`,bob,'POST',{version:1,diagram:'flowchart LR; A --> B'})).status,404);
  const saved = await request(`/api/projects/${project.id}/scene-graph`,alice,'PATCH',saveBody);
  assert.equal(saved.status,200); const version = (await saved.json()).version;
  assert.equal((await request(`/api/projects/${project.id}/scene-graph`,alice,'PATCH',saveBody)).status,409);
  const render = {version,requestId:randomUUID(),format:'mp4',orientation:'landscape'};
  assert.equal((await request(`/api/projects/${project.id}/render`,bob,'POST',render)).status,404);
  const submits = await Promise.all(Array.from({length:3},()=> request(`/api/projects/${project.id}/render`,alice,'POST',render)));
  for (const response of submits) { assert.equal(response.status,202,await response.clone().text()); assert.equal((await response.json()).id,render.requestId); }
  assert.equal(Number((await pool.query('SELECT count(*) FROM render_jobs WHERE user_id=$1',[owners[0]])).rows[0].count),1);
  assert.equal((await request(`/api/render-jobs/${render.requestId}`,bob)).status,404);
  assert.equal((await request(`/api/render-jobs/${render.requestId}/download`,bob)).status,404);
  assert.equal((await request(`/api/render-jobs/${render.requestId}/download`,alice)).status,409);
  assert.equal((await request(`/api/projects/${project.id}/render`,alice,'POST',{...render,requestId:randomUUID()})).status,429);
  // A failed render releases its allowance; the same request ID is still a replay.
  await pool.query("UPDATE render_jobs SET status='failed' WHERE id=$1",[render.requestId]);
  assert.equal((await (await request(`/api/projects/${project.id}/render`,alice,'POST',render)).json()).status,'failed');
  for (let i=0;i<2;i++) {
    const response = await request(`/api/projects/${project.id}/render`,alice,'POST',{...render,requestId:randomUUID()});
    assert.equal(response.status,202); const data=await response.json();
    await pool.query("UPDATE render_jobs SET status='completed',progress=100 WHERE id=$1",[data.id]);
  }
  const last = await Promise.all(Array.from({length:3},()=> request(`/api/projects/${project.id}/render`,alice,'POST',{...render,requestId:randomUUID()})));
  assert.deepEqual(last.map(r=>r.status).sort(),[202,402,402]);
  const winner=await last.find(r=>r.status===202)!.json();
  // An authenticated fixture tests actual HTTP streaming separately from encoding.
  const outputDir=process.env.RENDER_OUTPUT_DIR; assert.ok(outputDir,'Set RENDER_OUTPUT_DIR for both web and this test.');
  const key=`${randomUUID()}.mp4`; const filename=path.join(outputDir,key);
  await mkdir(outputDir,{recursive:true}); await writeFile(filename,'0123456789');
  try {
    await pool.query("UPDATE render_jobs SET status='completed',progress=100,output_key=$2 WHERE id=$1",[winner.id,key]);
    const result=await fetch(`${base}/api/render-jobs/${winner.id}/download`,{headers:{cookie:alice,range:'bytes=2-5'}});
    assert.equal(result.status,206); assert.equal(await result.text(),'2345');
    assert.equal((await request(`/api/render-jobs/${winner.id}/download`,bob)).status,404);
    const reopened=await (await request(`/api/projects/${project.id}`,alice)).json();
    assert.equal(reopened.latestRender.id,winner.id); assert.equal(reopened.sceneGraph.projectId,project.id);
  } finally {await unlink(filename);}
  console.log('PASS: ownership, optimistic saves, idempotency, concurrent quota, failure release, durable recovery and private download.');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(owners.length) await pool.query('DELETE FROM "user" WHERE id=ANY($1::text[])',[owners]);
  await pool.end();
});

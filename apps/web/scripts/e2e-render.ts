/** Real render smoke test. Needs migrated DB, Redis, web and worker. Uses one free render. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { generateMockSceneGraph } from '@explainmotion/ai';
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
async function main() {
  const signup=await fetch(`${base}/api/auth/sign-up/email`,{method:'POST',headers:{'content-type':'application/json',origin:base},body:JSON.stringify({email:`render-${randomUUID()}@example.test`,password:randomUUID()+'Aa1!',name:'Render smoke test'})});
  assert.equal(signup.status,200,await signup.clone().text());
  const cookie=signup.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  async function call(url:string,method='GET',body?:unknown) {
    const result=await fetch(base+url,{method,headers:{cookie,origin:base,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    assert.ok(result.ok,await result.clone().text()); return result.json();
  }
  const project=await call('/api/projects','POST',{title:'Smoke render',prompt:'Explain money transfer'});
  const graph=generateMockSceneGraph(project.id,'Explain money transfer');
  graph.scenes=graph.scenes.slice(0,1);
  const saved=await call(`/api/projects/${project.id}/scene-graph`,'PATCH',{version:project.version,sceneGraph:graph,prompt:project.prompt,sourceType:'prompt'});
  const job=await call(`/api/projects/${project.id}/render`,'POST',{version:saved.version,requestId:randomUUID(),format:'mp4',orientation:'landscape'});
  for(let i=0;i<400;i++) {
    const current=await call(`/api/render-jobs/${job.id}`);
    if(current.status==='failed') throw new Error(current.errorMessage);
    if(current.status==='completed') {
      const media=await fetch(base+current.outputUrl,{headers:{cookie}});
      assert.equal(media.status,200); const bytes=Buffer.from(await media.arrayBuffer());
      assert.equal(bytes.subarray(4,8).toString(),'ftyp');
      console.log(`PASS: real MP4, ${bytes.length} bytes, project ${project.id}`); return;
    }
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
  throw new Error('Timed out waiting for worker');
}
main().catch(error=>{console.error(error);process.exitCode=1;});

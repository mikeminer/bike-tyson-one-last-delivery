import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,step,selectReplay,sampleHistory} from '../src/simulation.mjs';
test('a skilled run can deliver; recorded Funny Finish samples are from that run',()=>{
  const run=createRun(43);let jump=false;
  while(!run.done){
    const next=run.obstacles.find(o=>o.hit<0&&!o.passed&&o.z-run.distance>0&&o.z-run.distance<12);
    const steer=next&&next.type!=='ramp'?Math.sign((next.x<=0?2.8:-2.8)-run.x):0;
    jump=!!next&&next.z-run.distance<7&&run.y===0;
    step(run,{steer,jump,punch:run.cooldown===0},1/60);
  }
  assert.equal(run.delivered,true);assert.ok(run.t<45);assert.ok(run.score>1000);
  const clip=selectReplay(run);assert.ok(clip.end<=run.t);assert.ok(clip.start>=0);assert.equal(clip.end-clip.start,4);
  const middle=sampleHistory(run.history,(clip.start+clip.end)/2);assert.ok(middle.t>=clip.start&&middle.t<=clip.end);
});
test('failure ends a run, controls cannot move a finished run, same seed and input are reproducible',()=>{
  const a=createRun(11),b=createRun(11);
  while(!a.done){step(a,{steer:0,jump:false,punch:false},1/60);step(b,{steer:0,jump:false,punch:false},1/60);}
  assert.deepEqual(a,b);const x=a.x;step(a,{steer:1,jump:true,punch:true},1/60);assert.equal(a.x,x);
  assert.ok(a.t<=45.02);assert.ok(a.history.length<1000);
});

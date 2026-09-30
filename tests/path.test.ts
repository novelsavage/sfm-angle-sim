import {test} from 'node:test';
import assert from 'node:assert/strict';
import {samplePath,geometry} from '../src/path.ts';

test('all teaching camera routes stay inside the room and below its ceiling',()=>{
  for(const space of ['room','toilet'] as const)for(let step=0;step<5;step++)for(const height of [.65,1,1.5])for(let i=0;i<=200;i++){
    const {position:p,target}=samplePath(space,step,i/200,height),g=geometry[space];
    assert.ok([...p,...target].every(Number.isFinite));
    assert.ok(Math.abs(p[0])<g.width/2&&Math.abs(p[2])<g.depth/2,`${space}/${step}/${i}: outside walls`);
    assert.ok(p[1]>=.45&&p[1]<2.5);
    assert.ok(Math.hypot(...p.map((v,k)=>v-target[k]))>.05,'camera has a viewing direction');
  }
});
test('whole-room passes translate and join without teleporting',()=>{
  for(const space of ['room','toilet'] as const)for(const step of [0,1,4]){
    assert.deepEqual(samplePath(space,step,0,1).position,samplePath(space,step,1,1).position);
    let distance=0;
    for(let i=1;i<=500;i++){
      const p=samplePath(space,step,i/500,1).position,q=samplePath(space,step,(i-1)/500,1).position;
      const delta=Math.hypot(...p.map((v,k)=>v-q[k]));assert.ok(delta<.05);distance+=delta;
    }
    assert.ok(distance>5,'must move through the space rather than rotate at one point');
  }
});
test('teaching camera does not pass through major room fixtures',()=>{
  const boxes=[{x:-1.83,z:-1.1,w:1.25,d:1.95,top:.58},{x:1.35,z:-1.4,w:1.48,d:.72,top:.8},{x:-.8,z:1.9,w:1.1,d:.55,top:.82}];
  for(let step=0;step<5;step++)for(const height of [.65,1,1.5])for(let i=0;i<=300;i++){
    const p=samplePath('room',step,i/300,height).position;
    for(const b of boxes)assert.ok(!(Math.abs(p[0]-b.x)<b.w/2&&Math.abs(p[2]-b.z)<b.d/2&&p[1]<b.top),`step ${step}: camera intersects fixture`);
  }
});

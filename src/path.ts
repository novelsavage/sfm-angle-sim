import type { Space } from './data';
export type Point = [number,number,number];
export interface Pose { position:Point; target:Point }
export const geometry = { room:{width:5.2,depth:4.4},toilet:{width:3.4,depth:3.5} };
// Teaching trajectories in a schematic space; never presented as paths measured in the source models.
export function samplePath(space:Space,step:number,t:number,height:number):Pose {
  const g=geometry[space], x=g.width/2-0.45,z=g.depth/2-0.45;
  let points:Point[],targets:Point[];
  const h=step===1?height+0.4:step===3?Math.max(.45,height-.45):height;
  if(step===3){
    if(space==='room'){
      points=[[-.1,h,.7],[.1,h,.1],[.15,h,-.65],[.4,h,-.9],[.75,h,-.95]];
      targets=points.map(()=>[1.35,.5,-1.2]);
    } else {
      points=[[-.6,h,.2],[-.7,h,-.25],[-.7,h,-.7],[-.4,h,-.95],[.05,h,-.9]];
      targets=points.map(()=>[.35,.8,-1.05]);
    }
  } else if(step===2){
    points=space==='room'?[[1.95,h,1.45],[1.95,h,.5],[.25,h,0],[0,h,-.7],[0,h,-1.8]]:[[-1,h,1.1],[-.7,h,.1],[-.7,h,-.6],[-.3,h,-.55],[.9,h,.3]];
    targets=[[-x,1,-z],[-x,1,-z],[x,1,-z],[x,1,z],[-x,1,z]];
  } else {
    if(space==='room'){
      // Bed and desk remain outside this clear central loop.
      points=[[-1.7,h,1.45],[.1,h,1.45],[1.95,h,1.3],[1.95,h,.15],[.1,h,-.65],[-.8,h,-.65],[-.8,h,.55],[-1.7,h,1.45]];
    } else {
      points=[[-.95,h,1.1],[.7,h,1.1],[.95,h,.35],[.9,h,-.55],[-.55,h,-.65],[-.95,h,.1],[-.95,h,1.1]];
    }
    targets=points.map((p,i)=> {
      if(step===4) return [i%2===0?-p[0]:0,i%2===0?.05:2.5,-p[2]*.5];
      return [-p[0]*.75,step===1?1.8:1,-p[2]*.75];
    });
  }
  const f=Math.min(1,Math.max(0,t))*(points.length-1), i=Math.min(points.length-2,Math.floor(f)),a=f-i;
  const lerp=(v:Point,w:Point):Point=>v.map((n,k)=>n+(w[k]-n)*a) as Point;
  return {position:lerp(points[i],points[i+1]),target:lerp(targets[i],targets[i+1])};
}

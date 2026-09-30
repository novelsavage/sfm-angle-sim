import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { samplePath,geometry } from './path';
import type {Space} from './data';

export class CaptureScene {
  renderer:T.WebGLRenderer;
  scene=new T.Scene();
  camera=new T.PerspectiveCamera(35,1,.05,100);
  phoneCamera=new T.PerspectiveCamera(65,1,.03,50);
  controls:OrbitControls;
  room=new T.Group(); route=new T.Group(); phone=new T.Group(); sight=new T.Group();enclosure=new T.Group();
  space:Space='room'; view='orbit';
  constructor(public host:HTMLElement){
    this.renderer=new T.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    this.renderer.setClearColor('#e8e9e3');
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
    this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.25;
    this.renderer.domElement.setAttribute('aria-label','撮影位置・視線・高さを示す3D模式図。横の手順説明でも動作を確認できます。');
    this.renderer.domElement.setAttribute('role','img');
    host.append(this.renderer.domElement);
    this.scene.add(new T.HemisphereLight('#ffffff','#818d84',2.6));
    const sun=new T.DirectionalLight('#fff6e3',3);sun.position.set(-3,8,5);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-5;sun.shadow.bias=-.0005;this.scene.add(sun);
    this.scene.add(this.room,this.route,this.phone,this.sight,this.enclosure);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.enablePan=false;this.controls.minDistance=4;this.controls.maxDistance=16;this.controls.maxPolarAngle=Math.PI/2-.02;
    this.setSpace('room');this.setView('orbit');
    new ResizeObserver(()=>this.resize()).observe(host);
  }
  clear(group:T.Group){
    group.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){o.geometry.dispose();const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(x=>x.dispose());}});
    group.clear();
  }
  box(w:number,h:number,d:number,x:number,y:number,z:number,color:string,parent=this.room){
    const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.85}));
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  tube(points:T.Vector3[],radius:number,color:string,parent=this.room){
    const curve=new T.CatmullRomCurve3(points);
    const mesh=new T.Mesh(new T.TubeGeometry(curve,32,radius,8,false),new T.MeshStandardMaterial({color,roughness:.4,metalness:.25}));parent.add(mesh);mesh.castShadow=true;return mesh;
  }
  setSpace(space:Space){
    this.space=space;this.clear(this.room);this.clear(this.phone);this.clear(this.enclosure);
    const {width:w,depth:d}=geometry[space];
    this.box(w+.2,.16,d+.2,0,-.13,0,'#b4b6ab');
    this.box(w,.04,d,0,-.025,0,space==='room'?'#c2ac8a':'#d9ddd4');
    const wallColor=space==='room'?'#dfded2':'#e2e8df';
    this.box(w,2.6,.1,0,1.3,-d/2,wallColor,this.enclosure);
    this.box(.1,2.6,d,-w/2,1.3,0,wallColor,this.enclosure);
    this.box(.1,2.6,d,w/2,1.3,0,wallColor,this.enclosure);
    this.box((w-.9)/2,2.6,.1,-(w+.9)/4,1.3,d/2,wallColor,this.enclosure);
    this.box((w-.9)/2,2.6,.1,(w+.9)/4,1.3,d/2,wallColor,this.enclosure);
    this.box(w,.1,d,0,2.65,0,'#edeee6',this.enclosure);
    this.box(w,.85,.1,0,.41,-d/2,wallColor);
    this.box(.1,.85,d,-w/2,.41,0,wallColor);
    // Cut-away edges remain low so the camera and trajectory are visible.
    this.box(.07,.09,d,w/2,.015,0,'#99a398');
    this.box(w,.09,.07,0,.015,d/2,'#99a398');
    this.box(.9,.055,.12,0,.025,d/2,'#f5f2e8');
    for(let i=0;i<Math.floor(w/.4);i++)this.box(.009,.004,d,-w/2+i*.4,.001,0,space==='room'?'#b5a080':'#c4cdc1');
    if(space==='room'){
      this.box(1.25,.25,1.95,-1.83,.13,-1.1,'#847861');
      this.box(1.2,.17,1.9,-1.83,.34,-1.1,'#f3efe1');
      this.box(1.21,.055,1.23,-1.83,.445,-.78,'#85958b');
      this.box(.92,.12,.4,-1.83,.49,-1.78,'#ece9db');
      this.box(1.48,.08,.72,1.35,.76,-1.4,'#977b59');
      for(const x of [.72,1.98])for(const z of [-1.65,-1.15])this.box(.045,.73,.045,x,.36,z,'#555e54');
      this.box(.9,.75,.45,1.95,.37,-1.95,'#b7b2a0');
      this.box(.45,.3,.045,1.3,.95,-1.62,'#354a47');
      this.box(.8,.08,.8,.25,.06,.4,'#c5b890');
      // Window and sill.
      this.box(1.2,.58,.025,-.2,.5,-d/2+.07,'#b4cbd0');
      this.box(1.3,.04,.17,-.2,.21,-d/2+.08,'#f0eee3');
      this.box(1.1,.65,.55,-.8,.32,1.9,'#a3aea0');
      this.box(1.1,.24,.15,-.8,.7,2.1,'#8d9d8e');
    } else {
      // Teaching fixtures, distinct from the linked real-world survey models.
      const bowl=new T.Mesh(new T.SphereGeometry(.32,32,16),new T.MeshStandardMaterial({color:'#faf9f1',roughness:.3}));bowl.scale.set(1,.65,1.4);bowl.position.set(.55,.48,-1.13);bowl.castShadow=true;this.room.add(bowl);
      this.box(.4,.4,.42,.55,.22,-1.22,'#e9ede5');
      this.box(.56,.55,.19,.55,.55,-1.57,'#edf0e8');
      const seat=new T.Mesh(new T.TorusGeometry(.22,.045,10,40),new T.MeshStandardMaterial({color:'#fffef7'}));seat.rotation.x=Math.PI/2;seat.scale.y=1.45;seat.position.set(.55,.63,-1.05);this.room.add(seat);
      this.tube([new T.Vector3(.03,.8,-1.6),new T.Vector3(.03,.8,-1),new T.Vector3(.03,.8,-.55)],.026,'#5b8079');
      this.tube([new T.Vector3(1.18,.2,-1.5),new T.Vector3(1.18,.8,-1.5),new T.Vector3(1.18,.8,-.55)],.027,'#5b8079');
      this.box(.65,.11,.56,-1.26,.76,-.85,'#f7f7ef');
      this.box(.1,.52,.12,-1.38,.45,-.85,'#a8b6ae');
      this.tube([new T.Vector3(-1.4,.78,-1),new T.Vector3(-1.4,.99,-1),new T.Vector3(-1.2,.99,-1)],.018,'#788e89');
      this.box(.03,.5,.5,-w/2+.07,.62,-.85,'#adbfbe');
      this.box(.18,.6,.72,1.47,.32,.4,'#b5bfab');
      this.box(.15,.16,.15,.1,.69,-1.62,'#a28c66');
      this.box(.08,.08,.06,.05,.42,-1.66,'#ab5844');
    }
    this.box(.12,.21,.024,0,0,0,'#164e47',this.phone);
    this.box(.095,.165,.007,0,0,.017,'#8ac3bb',this.phone);
    this.box(.018,.018,.008,-.028,.067,-.017,'#d1e3dc',this.phone);
    this.phone.scale.setScalar(1.5);
  }
  setView(view:string){
    this.view=view;this.controls.enabled=view==='orbit';
    if(view==='top'){this.camera.position.set(.001,10,0);this.camera.lookAt(0,0,0);}
    if(view==='orbit'){this.camera.position.set(6,5.5,6.5);this.controls.target.set(0,.3,0);this.controls.update();}
  }
  resize(){
    const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;
    this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.phoneCamera.aspect=width/height;this.phoneCamera.updateProjectionMatrix();
  }
  updatePath(step:number,height:number){
    this.clear(this.route);
    const points=[];
    for(let i=0;i<=100;i++){const p=samplePath(this.space,step,i/100,height).position;points.push(new T.Vector3(p[0],.06,p[2]));}
    const mat=new T.LineDashedMaterial({color:'#17685c',dashSize:.12,gapSize:.065});const line=new T.Line(new T.BufferGeometry().setFromPoints(points),mat);line.computeLineDistances();this.route.add(line);
    for(const t of [.12,.4,.7]){
      const p=samplePath(this.space,step,t,height).position,q=samplePath(this.space,step,t+.02,height).position;
      const dir=new T.Vector3(q[0]-p[0],0,q[2]-p[2]).normalize();this.route.add(new T.ArrowHelper(dir,new T.Vector3(p[0],.07,p[2]),.27,0x17685c,.14,.1));
    }
  }
  update(step:number,t:number,height:number){
    const pose=samplePath(this.space,step,t,height);const pos=new T.Vector3(...pose.position),target=new T.Vector3(...pose.target);
    this.phone.position.copy(pos);this.phone.lookAt(pos.clone().multiplyScalar(2).sub(target));this.phone.visible=this.view!=='phone';
    this.phoneCamera.position.copy(pos);this.phoneCamera.lookAt(target);
    this.clear(this.sight);
    const line=new T.Line(new T.BufferGeometry().setFromPoints([pos,target]),new T.LineDashedMaterial({color:'#245ea8',dashSize:.08,gapSize:.05}));line.computeLineDistances();this.sight.add(line);
    const dir=target.clone().sub(pos).normalize(),side=new T.Vector3().crossVectors(dir,new T.Vector3(0,1,0)).normalize();
    const length=Math.min(1.45,pos.distanceTo(target));const far=pos.clone().addScaledVector(dir,length),a=far.clone().addScaledVector(side,length*.48),b=far.clone().addScaledVector(side,-length*.48);
    const geo=new T.BufferGeometry().setFromPoints([pos,a,b]);geo.setIndex([0,1,2]);geo.computeVertexNormals();this.sight.add(new T.Mesh(geo,new T.MeshBasicMaterial({color:'#245ea8',transparent:true,opacity:.15,side:T.DoubleSide,depthWrite:false})));
    const stem=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(pos.x,.04,pos.z),pos]),new T.LineDashedMaterial({color:'#17685c',dashSize:.04,gapSize:.035}));stem.computeLineDistances();this.sight.add(stem);
    const ring=new T.Mesh(new T.RingGeometry(.09,.13,28),new T.MeshBasicMaterial({color:'#17685c',side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(pos.x,.045,pos.z);this.sight.add(ring);
    this.sight.visible=this.view!=='phone';this.route.visible=this.view!=='phone';
    this.enclosure.visible=this.view==='phone';
    if(this.view==='orbit')this.controls.update();
    this.renderer.render(this.scene,this.view==='phone'?this.phoneCamera:this.camera);
  }
}

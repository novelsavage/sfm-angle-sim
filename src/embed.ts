import type {Model} from './data';
declare global {interface Window {Sketchfab?:new (iframe:HTMLIFrameElement)=>{init:(id:string,options:Record<string,unknown>)=>void}}}
let sdk:Promise<void>|null=null;
function loadSdk(){
  if(window.Sketchfab)return Promise.resolve();
  if(!sdk)sdk=new Promise<void>((resolve,reject)=>{
    const s=document.createElement('script');s.src='https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';s.async=true;
    s.onload=()=>resolve();s.onerror=()=>{s.remove();sdk=null;reject(new Error('Viewer SDK unavailable'));};document.head.append(s);
  });
  return sdk;
}
export class ModelViewer {
  generation=0;timer:ReturnType<typeof setTimeout>|undefined;model:Model|null=null;
  constructor(public host:HTMLElement,public status:HTMLElement){}
  reset(model:Model){
    this.model=model;this.generation++;clearTimeout(this.timer);this.host.replaceChildren();
    this.status.textContent='公式ビューアで、家具・設備の配置を確認できます。';
    const placeholder=document.createElement('div');placeholder.className='model-placeholder';
    placeholder.innerHTML=`<svg viewBox="0 0 160 120" aria-hidden="true"><path d="m80 14 57 29v54l-57 17-57-29V31Z M23 31l57 29 57-17M80 60v54" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m44 65 22 11v23M97 69l23-7v21l-23 7Z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><button class="load-model">3Dモデルを読み込む <span aria-hidden="true">↗</span></button><span>Sketchfabの外部コンテンツ</span>`;
    const thumb=document.createElement('img');thumb.src=model.thumbnail;thumb.alt=model.name+'の配布元プレビュー';thumb.className='model-thumbnail';thumb.loading='lazy';thumb.addEventListener('error',()=>thumb.remove());
    placeholder.prepend(thumb);
    this.host.append(placeholder);placeholder.querySelector('button')!.addEventListener('click',()=>this.load());
    this.host.dataset.state='idle';
  }
  async load(){
    const model=this.model;if(!model)return;
    const generation=++this.generation;clearTimeout(this.timer);
    this.host.dataset.state='loading';this.status.textContent='3Dモデルを読み込み中…';
    this.host.replaceChildren();const iframe=document.createElement('iframe');iframe.title=model.name+'の3Dモデル';iframe.allow='autoplay; fullscreen; xr-spatial-tracking';iframe.allowFullscreen=true;this.host.append(iframe);
    const failure=(reason?:unknown)=>{
      if(this.generation!==generation)return;
      this.generation++;clearTimeout(this.timer);this.host.dataset.state='error';
      this.host.innerHTML='<div class="model-placeholder"><p>外部モデルを読み込めませんでした。</p><button class="retry-model">再読み込み</button></div>';
      this.status.textContent=typeof reason==='string'&&/webgl|hardware/i.test(reason)?'外部ビューアがこの環境の3D描画に対応していません。別のWebGL対応ブラウザか、下の配布元で確認してください。':'通信状況を確認するか、下の「配布元を開く」から確認してください。';
      this.host.querySelector('button')!.addEventListener('click',()=>this.load());
    };
    this.timer=setTimeout(failure,90000);
    try{
      await loadSdk();if(this.generation!==generation)return;
      if(!window.Sketchfab){failure();return;}
      const client=new window.Sketchfab(iframe);
      client.init(model.id,{autostart:1,preload:1,ui_stop:0,ui_infos:1,ui_watermark:1,
        success:(api:{start:()=>void;addEventListener:(name:string,fn:()=>void)=>void})=>{
          if(this.generation!==generation)return;
          api.addEventListener('viewerready',()=>{if(this.generation!==generation)return;clearTimeout(this.timer);this.host.dataset.state='ready';this.status.textContent='ドラッグで回転・ピンチで拡大。撮影の死角を探してみましょう。';});api.start();
        },error:failure});
    }catch{failure();}
  }
}

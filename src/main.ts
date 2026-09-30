import './style.css';
import {models,devices,steps,appFacts,type Space} from './data';
import {CaptureScene} from './scene';
import {ModelViewer} from './embed';
import {samplePath} from './path';

const icons={play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',prev:'<path d="m14 6-6 6 6 6"/>',next:'<path d="m10 6 6 6-6 6"/>',camera:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 5h4M11 19h2"/>',route:'<path d="M5 19V5h14v14h-8M15 15l4 4 4-4"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>'};
function icon(name:keyof typeof icons){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;}
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
  <a class="skip-link" href="#controls">撮影操作へ移動</a>
  <header class="site-header">
    <div class="brand">${icon('route')}<div><h1>撮影ルート</h1><span>室内フォトグラメトリ</span></div></div>
    <div class="header-tools"><button id="prep-open">撮影前の確認</button><button id="sources-open">出典・使い方 <span aria-hidden="true">↗</span></button></div>
  </header>
  <main>
    <section class="selection" aria-label="撮影する空間と参考モデル">
      <div class="space-tabs" role="group" aria-label="空間の種類"><button data-space="room" aria-pressed="true">ワンルーム</button><button data-space="toilet" aria-pressed="false">多目的トイレ</button></div>
      <div class="model-select"><label for="model">参考3Dモデル</label><select id="model"></select></div>
      <span class="model-kind" id="model-kind"></span>
    </section>
    <div class="workspace">
      <section class="simulation" aria-label="撮影動作の模式図">
        <div class="scene-top"><span class="scene-title">撮影の動き <small>模式図</small></span><div class="view-tabs" role="group" aria-label="模式図の視点"><button data-view="orbit" aria-pressed="true">俯瞰</button><button data-view="top" aria-pressed="false">平面</button><button data-view="phone" aria-pressed="false">スマホ視点</button></div></div>
        <div id="scene"></div>
        <div class="scene-reading"><div><span class="small-label">スマホの高さ</span><strong id="height-reading">1.00 <small>m</small></strong></div><span id="step-position">1 / 5</span></div>
        <div class="scene-bottom"><div class="legend"><span><i class="route-key"></i>移動</span><span><i class="sight-key"></i>スマホの向き</span></div><span id="scene-hint">ドラッグで回転</span></div>
        <div class="diagram-note">共通動作の模式図です。右のモデルの間取り・寸法とは異なります。</div>
      </section>
      <aside class="guide-panel">
        <div class="reference-heading"><h2>参考3D</h2><button id="model-expand" aria-expanded="false">大きく見る ↗</button></div>
        <div id="model-viewer"></div>
        <p id="model-status" class="model-status" role="status"></p>
        <div class="model-credit"><span id="model-author"></span><a id="model-link" target="_blank" rel="noopener noreferrer">配布元を開く ↗</a></div>
        <section class="instruction" aria-live="polite" aria-atomic="true">
          <div class="instruction-label"><span id="instruction-number">01</span><h2 id="step-name"></h2></div>
          <p class="action" id="step-action"></p><p class="focus"><span>写すもの</span><span id="step-focus"></span></p>
          <details><summary>この動作のポイント</summary><p id="step-note"></p></details>
        </section>
      </aside>
    </div>
    <section class="playback" id="controls" aria-label="撮影フローの再生" tabindex="-1">
      <nav class="step-tabs" aria-label="撮影の段階" id="step-tabs"></nav>
      <div class="transport">
        <div class="play-buttons"><button id="prev" class="icon-button" aria-label="前の段階">${icon('prev')}</button><button id="play" class="play-button">${icon('play')}<span>再生する</span></button><button id="next" class="icon-button" aria-label="次の段階">${icon('next')}</button></div>
        <div class="scrubber"><label for="progress">この段階の位置</label><input id="progress" type="range" min="0" max="1000" value="0"/><output for="progress" id="progress-value">0%</output></div>
        <div class="speed-control"><label for="speed">表示速度</label><select id="speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option></select></div>
      </div>
      <div class="capture-settings"><div class="height-control"><label for="height">${icon('camera')}基準の高さ</label><input id="height" type="range" min="65" max="150" step="5" value="100"/><output id="height-value" for="height">100 cm</output></div><span>撮れる高さに合わせる。上面の補完は分担してもOK。</span></div>
    </section>
    <section class="workflow" aria-labelledby="workflow-title">
      <div class="workflow-title"><h2 id="workflow-title">撮った動画を、3Dにする</h2><span>無料版での進め方</span></div>
      <div class="device-bar"><label for="device">スマホ</label><select id="device">${devices.map(d=>`<option>${d}</option>`).join('')}</select><span id="device-note">標準1×のレンズを固定。4K / 30fpsは試し撮りの候補。</span></div>
      <div class="app-tabs" role="group" aria-label="使用するアプリ"><button data-app="kiri" aria-pressed="true">KIRI Engine <small>Basic</small></button><button data-app="poly" aria-pressed="false">Polycam <small>Free</small></button></div>
      <div class="app-content"><div><h3 id="app-headline"></h3><ol id="app-flow"></ol></div><div class="limits"><h3>無料枠を確認</h3><ul id="app-facts"></ul><a id="app-source" target="_blank" rel="noopener noreferrer">公式プランを確認 ↗</a></div></div>
      <details class="app-note"><summary>取り込み・撮影設定の補足</summary><p id="app-note"></p><p>全機種共通でLiDARを使わない手順です。露出・ピント・WB固定の操作は端末とアプリで異なります。5機種での実機検証は未実施です。選んだ画像で70〜80%程度の重なりを目安にし、同じ面を異なる位置から少なくとも3画像で観察します。150枚で足りない場合は範囲を分けて撮影しますが、別モデルが自動的につながるわけではありません。</p><p>上の動作図の画角は説明用です。各端末の実際の画角や復元精度を再現するものではありません。表示速度は実際に歩く速度ではありません。</p></details>
    </section>
    <footer><span>位置を変える。共通する面を残す。</span><span>仕様確認：2026.09.30 · <button id="footer-sources">出典</button></span></footer>
  </main>
  <dialog id="sources-dialog" aria-labelledby="sources-title"><div class="dialog-heading"><h2 id="sources-title">出典・使い方</h2><button class="close-dialog icon-button" aria-label="出典を閉じる">${icon('close')}</button></div><div class="dialog-content"><p>左は撮影の動作を学ぶ模式図、参考3Dは公開された別のモデルです。実測モデル上の位置や経路を計算するシミュレーターではありません。</p><h3>参考3Dモデル</h3><div class="source-list">${models.map(m=>`<article><a href="${m.url}" target="_blank" rel="noopener noreferrer">${m.name} ↗</a><p>${m.author} · ${m.kind}</p><p>${m.description}</p><small>${m.license}</small></article>`).join('')}</div><h3>アプリの無料版</h3><p><a href="https://www.kiriengine.app/pricing" target="_blank" rel="noopener noreferrer">KIRI Engine Pricing</a> / <a href="https://www.kiriengine.app/faq" target="_blank" rel="noopener noreferrer">FAQ</a> / <a href="https://poly.cam/pricing" target="_blank" rel="noopener noreferrer">Polycam Pricing</a>（2026年9月30日確認）。プランやOSによる差があるため、撮影前に現在の画面でも確認してください。</p><h3>撮影手順の根拠</h3><p>提供された「狭小室内・トイレをSfMフォトグラメトリで撮影するための実践調査報告」を参考に構成。壁沿いの移動、複数高さ、対角の接続、設備の死角補完を取り入れています。</p><p>動画設定・模式図の経路は学習用の提案です。鏡、無地壁、光沢のある設備は復元が難しく、撮影できたことと形状・寸法が正しいことは別です。</p></div></dialog>
  <dialog id="prep-dialog" aria-labelledby="prep-title"><div class="dialog-heading"><h2 id="prep-title">撮影前の確認</h2><button class="close-dialog icon-button" aria-label="確認を閉じる">${icon('close')}</button></div><div class="dialog-content"><p>現場で最初に確認すること。チェックはこの画面を開いている間だけ保持されます。</p><div class="checklist">${['撮影許可と利用者のいない時間を確保した','照明を一定にし、鏡・反射・暗部を確認した','扉・便座・手すりなどの状態を決めた','充電・空き容量・レンズの汚れを確認した','短く試し撮りし、ブレ・ピント・白飛びを確認した','寸法を測る場合、基準長と検証用の距離を記録した'].map(t=>`<label><input type="checkbox"/>${t}</label>`).join('')}</div><p>呼出し設備や通路をふさがず、届かない場所は撮影を分担します。人物が写った映像は取り込み対象から除きます。</p></div></dialog>`;

const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
let space:Space='room',step=0,progress=0,height=1,speed=1,playing=false;
let scene:CaptureScene|null=null;
try{scene=new CaptureScene(el('scene'));}catch{el('scene').innerHTML='<div class="webgl-error"><h2>3D表示を開始できませんでした</h2><p>WebGL対応のブラウザで開き直してください。段階ごとの撮影手順は下のボタンから確認できます。</p><button id="reload">再読み込み</button></div>';el('reload')?.addEventListener('click',()=>location.reload());}
const viewer=new ModelViewer(el('model-viewer'),el('model-status'));
function setPlaying(value:boolean){playing=value;el('play').innerHTML=icon(playing?'pause':'play')+`<span>${playing?'一時停止':'再生する'}</span>`;el('play').setAttribute('aria-label',playing?'撮影動作を一時停止':'撮影動作を再生');}
function selectModel(){
  const model=models.find(m=>m.id===el<HTMLSelectElement>('model').value)!;
  viewer.reset(model);el('model-kind').textContent=model.kind;el('model-author').textContent=model.author;el<HTMLAnchorElement>('model-link').href=model.url;
}
function updateStep(reset=true){
  if(reset){progress=0;setPlaying(false);}const s=steps[space][step];
  el('step-tabs').innerHTML=steps[space].map((s,i)=>`<button data-step="${i}" aria-current="${step===i?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span>${s.name}</button>`).join('');
  el('step-tabs').querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.addEventListener('click',()=>{step=Number(b.dataset.step);updateStep();}));
  el('instruction-number').textContent=String(step+1).padStart(2,'0');el('step-name').textContent=s.name;el('step-action').textContent=s.action;el('step-focus').textContent=s.focus;el('step-note').textContent=s.note;el('step-position').textContent=`${step+1} / 5`;
  el<HTMLButtonElement>('prev').disabled=step===0;el<HTMLButtonElement>('next').disabled=step===4;scene?.updatePath(step,height);updateProgress();
}
function updateProgress(){
  el<HTMLInputElement>('progress').value=String(Math.round(progress*1000));el('progress-value').textContent=`${Math.round(progress*100)}%`;
  const h=samplePath(space,step,progress,height).position[1];el('height-reading').innerHTML=`${h.toFixed(2)} <small>m</small>`;
}
function selectSpace(next:Space){
  space=next;step=0;document.querySelectorAll<HTMLButtonElement>('[data-space]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.space===space)));
  el('model').innerHTML=models.filter(m=>m.space===space).map(m=>`<option value="${m.id}">${m.name} — ${m.space==='room'?m.author:'東京都'}</option>`).join('');
  scene?.setSpace(space);selectModel();updateStep();
}
function selectApp(key:'kiri'|'poly'){
  const a=appFacts[key];document.querySelectorAll<HTMLButtonElement>('[data-app]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.app===key)));
  el('app-headline').textContent=a.headline;el('app-flow').innerHTML=a.flow.map(s=>`<li>${s}</li>`).join('');el('app-facts').innerHTML=a.facts.map(s=>`<li>${s}</li>`).join('');el('app-note').textContent=a.note;el<HTMLAnchorElement>('app-source').href=a.url;
}
document.querySelectorAll<HTMLButtonElement>('[data-space]').forEach(b=>b.addEventListener('click',()=>selectSpace(b.dataset.space as Space)));
document.querySelectorAll<HTMLButtonElement>('[data-app]').forEach(b=>b.addEventListener('click',()=>selectApp(b.dataset.app as 'kiri'|'poly')));
document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));scene?.setView(b.dataset.view!);
  el('scene-hint').textContent=b.dataset.view==='phone'?'説明用の画角・レンズは固定':b.dataset.view==='top'?'移動経路を上から確認':'ドラッグで回転';
}));
el('model').addEventListener('change',selectModel);
el('play').addEventListener('click',()=>{if(progress===1)progress=0;setPlaying(!playing);});
el('prev').addEventListener('click',()=>{step=Math.max(0,step-1);updateStep();});el('next').addEventListener('click',()=>{step=Math.min(4,step+1);updateStep();});
el('progress').addEventListener('input',()=>{setPlaying(false);progress=Number(el<HTMLInputElement>('progress').value)/1000;updateProgress();});
el('height').addEventListener('input',()=>{height=Number(el<HTMLInputElement>('height').value)/100;el('height-value').textContent=`${Math.round(height*100)} cm`;scene?.updatePath(step,height);updateProgress();});
el('speed').addEventListener('change',()=>{speed=Number(el<HTMLSelectElement>('speed').value);});
el('device').addEventListener('change',()=>{el('device-note').textContent=`${el<HTMLSelectElement>('device').value}：標準1×を固定。4K / 30fpsで短く試し撮り。`;});
for(const id of ['sources-open','footer-sources'])el(id).addEventListener('click',()=>{setPlaying(false);el<HTMLDialogElement>('sources-dialog').showModal();});
el('prep-open').addEventListener('click',()=>{setPlaying(false);el<HTMLDialogElement>('prep-dialog').showModal();});
document.querySelectorAll<HTMLButtonElement>('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog')!.close()));
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
el('model-expand').addEventListener('click',()=>{
  const expanded=document.querySelector('.workspace')!.classList.toggle('reference-expanded');el('model-expand').textContent=expanded?'元の大きさに戻す ↙':'大きく見る ↗';el('model-expand').setAttribute('aria-expanded',String(expanded));scene?.resize();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>setPlaying(false));
selectSpace('room');selectApp('kiri');
let last=0,readout=0;
function frame(now:number){
  const dt=Math.min((now-last)/1000,.08);last=now;
  if(playing){progress=Math.min(1,progress+dt*speed/24);if(progress===1)setPlaying(false);}
  if(now-readout>100){updateProgress();readout=now;}
  scene?.update(step,progress,height);requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

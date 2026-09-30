import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
// External failure is deliberate here: it must not block the local teaching flow.
await page.route('https://static.sketchfab.com/**',r=>r.abort());
await page.route('https://fonts.googleapis.com/**',r=>r.abort());
await page.route('https://media.sketchfab.com/**',r=>r.abort());
await page.goto('http://127.0.0.1:5173');
await page.locator('#scene canvas').waitFor();
await page.screenshot({path:'test-results/desktop.png',fullPage:true});
await page.getByRole('button',{name:'撮影動作を再生',exact:true}).click();
await page.waitForTimeout(450);
assert.ok(Number(await page.locator('#progress').inputValue())>0);
await page.getByRole('button',{name:'撮影動作を一時停止'}).click();
for(const id of ['cae2d96ede1d4112b1fd391099a43f77','c7903169915d478898d35b32b0eac7be']){
  await page.locator('#model').selectOption(id);assert.ok((await page.locator('#model-link').getAttribute('href')).endsWith(id));
}
await page.getByRole('button',{name:'多目的トイレ',exact:true}).click();
assert.equal(await page.locator('#model option').count(),2);
assert.match(await page.locator('#model-kind').textContent(),/実測/);
for(const id of ['dfcb99cda1b947fd9d70a15fe0715997','697c4aec7ef14b0ab8fc9f06961acd64']){
  await page.locator('#model').selectOption(id);assert.ok((await page.locator('#model-link').getAttribute('href')).endsWith(id));
}
await page.locator('[data-step="3"]').click();
assert.match(await page.locator('#step-action').textContent(),/手すり/);
await page.locator('#height').fill('65');
assert.match(await page.locator('#height-reading').textContent(),/0.45/);
await page.locator('#progress').fill('600');
assert.equal(await page.locator('#progress-value').textContent(),'60%');
await page.getByRole('button',{name:'スマホ視点',exact:true}).click();
await page.screenshot({path:'test-results/phone-view.png'});
await page.getByRole('button',{name:'平面',exact:true}).click();
await page.screenshot({path:'test-results/top-view.png'});
await page.locator('[data-app="poly"]').click();
assert.match(await page.locator('#app-facts').textContent(),/3分/);
for(const device of ['Pixel 8a','iPhone 13 mini','iPhone 14','iPhone 17','Nothing Phone (3a)']){
  await page.locator('#device').selectOption(device);assert.match(await page.locator('#device-note').textContent(),new RegExp(device.replace(/[()]/g,'\\$&')));
}
await page.getByRole('button',{name:'3Dモデルを読み込む'}).click();
await page.locator('#model-viewer[data-state="error"]').waitFor();
assert.equal(await page.locator('.retry-model').count(),1);
await page.getByRole('button',{name:'撮影前の確認',exact:true}).click();
await page.locator('#prep-dialog input').first().check();
await page.keyboard.press('Escape');
assert.equal(await page.locator('#prep-dialog').evaluate(d=>d.open),false);
await page.getByRole('button',{name:'出典・使い方'}).click();
assert.equal(await page.locator('.source-list article').count(),4);
await page.keyboard.press('Escape');
await page.locator('#model-expand').click();
assert.equal(await page.locator('#model-expand').getAttribute('aria-expanded'),'true');
await page.locator('#model-expand').click();
await page.locator('[data-view="orbit"]').click();
for(const width of [768,390,320]){
  await page.setViewportSize({width,height:900});
  await page.waitForTimeout(200);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow at ${width}`);
  await page.screenshot({path:`test-results/width-${width}.png`,fullPage:true});
}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
assert.equal(await page.getByRole('button',{name:'撮影動作を再生'}).count(),1);
await page.keyboard.press('Tab');assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),true);
assert.deepEqual(errors,[]);
console.log('Browser checks passed: playback, 2 spaces / 4 model selections, steps, views, height, 5 phones, free plans, external failure, dialogs, 4 widths, reduced motion.');
await browser.close();

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('extension/sidepanel.html','utf8');
const launch=readFileSync('extension/gallery-launch.mjs','utf8');
const manifest=JSON.parse(readFileSync('extension/manifest.json','utf8'));
test('Protected gallery opens only from explicit Edge UI action',()=>{
 assert.match(html,/id="open-gallery"/);
 assert.match(html,/src="gallery-launch\.mjs"/);
 assert.match(launch,/getElementById\('open-gallery'\)\?\.addEventListener\('click'/);
 assert.match(launch,/chrome\.tabs\.create/);
 assert.match(launch,/^const URL = 'https:\/\/datapass-visual-gallery-preview\.datapass\.workers\.dev\/';/m);
});
test('Gallery shortcut adds no surveillance permissions',()=>{
 assert.deepEqual(manifest.permissions,['tabs','storage','sidePanel']);
 assert.ok(!JSON.stringify(manifest).includes('datapass-visual-gallery-preview'));
 assert.ok(!/fetch\(|executeScript|chrome\.scripting|setInterval|setTimeout/.test(launch));
});

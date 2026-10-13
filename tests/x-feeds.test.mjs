import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS,normalizeXUrl,normalizeXFeeds,allFeeds,addXFeed,removeXFeed,shiftXFeed,MAX_CUSTOM_FEEDS} from '../extension/x-feeds-model.mjs';
test('preset X shortcuts are URL-only and canonical',()=>{
  assert.equal(PRESETS.length,6);assert.equal(PRESETS[0].url,'https://x.com/home');
  assert.ok(PRESETS.every(feed=>normalizeXUrl(feed.url)===feed.url));
});
test('safe X URL canonicalization for search lists bookmarks and profiles',()=>{
  assert.equal(normalizeXUrl('https://twitter.com/search?q=Microsoft%20Fabric&f=live'),PRESETS[4].url);
  assert.equal(normalizeXUrl('https://x.com/i/lists/12345'),'https://x.com/i/lists/12345');
  assert.equal(normalizeXUrl('https://www.x.com/i/bookmarks'),'https://x.com/i/bookmarks');
  assert.equal(normalizeXUrl('https://x.com/data_guy'),'https://x.com/data_guy');
});
test('rejects phishing unsafe URLs and privileged routes',()=>{
  for(const url of ['http://x.com/home','https://x.com.evil.org/home','https://user:pass@x.com/home',
    'https://x.com/login','https://x.com/compose/post','https://x.com/settings','https://evil.org/home',
    'javascript:alert(1)','https://x.com/search?q=','https://x.com/search?q=abc#frag',
    'https://x.com/i/lists/../bookmarks'])assert.equal(normalizeXUrl(url),null,url);
});
test('create, reorder, remove personal feed shortcuts',()=>{
  const first=addXFeed(null,'Data Viz','https://x.com/search?q=charts&f=live','custom-1234567');
  const second=addXFeed(first,'My curated list','https://x.com/i/lists/12345','custom-1234568');
  assert.equal(second.activeId,'custom-1234568');assert.equal(allFeeds(second).length,8);
  assert.equal(shiftXFeed(second,'custom-1234568',-1).custom[0].id,'custom-1234568');
  assert.equal(removeXFeed(second,'custom-1234568').custom.length,1);
});
test('normalization removes corrupt duplicate records',()=>{
  const state=normalizeXFeeds({activeId:'evil',custom:[{id:'bad',label:'x',url:'https://evil.net'},
    {id:'custom-valid123',label:'Only A',url:'https://x.com/search?q=test'},
    {id:'custom-valid124',label:'Only B',url:'https://x.com/search?q=test'}]});
  assert.equal(state.activeId,'home');assert.equal(state.custom.length,1);
});
test('rejects duplicates and protects 24-feed capacity',()=>{
  assert.throws(()=>addXFeed(null,'Existing',PRESETS[0].url,'custom-1234567'),/déjà/);
  let state=normalizeXFeeds(null);
  for(let i=0;i<MAX_CUSTOM_FEEDS;i++)state=addXFeed(state,'Feed '+i,'https://x.com/search?q=feed'+i,'custom-'+String(i).padStart(8,'0'));
  assert.throws(()=>addXFeed(state,'Extra','https://x.com/search?q=extra','custom-extra999'),/Maximum/);
});

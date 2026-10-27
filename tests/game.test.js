import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,answer,upgrade,questions,accrue} from '../src/game.js';
test('correct reward is idempotent across clicks and new practice rounds',()=>{
 const s=initialState(),q=questions[0];const a=answer(s,q,q.correct);
 assert.equal(a.knowledge,2);assert.equal(answer(a,q,q.correct).knowledge,2);
 assert.equal(answer({...a,answers:{}},q,q.correct).knowledge,2);
});
test('wrong answers do not grant rewards and daily cap is enforced',()=>{
 const s=initialState();assert.equal(answer(s,questions[0],0).knowledge,0);
 const now=Date.now();const date=new Date(now+28800000).toISOString().slice(0,10);
 assert.equal(answer({...s,daily:{date,earned:29}},questions[0],1,now).knowledge,1);
});
test('upgrades deduct atomically, reject insufficient funds and max level',()=>{
 const s=initialState();const a=upgrade(s,'farm');assert.equal(a.food,0);assert.equal(a.levels.farm,2);
 assert.deepEqual(upgrade(a,'farm'),a);
 const max={...s,food:400,knowledge:50,levels:{...s.levels,farm:3}};assert.deepEqual(upgrade(max,'farm'),max);
});
test('offline production excludes rest and weekends and respects capacity',()=>{
 const s=initialState();const start=Date.parse('2026-10-26T16:00:00+08:00');
 assert.equal(accrue({...s,lastAccrual:start},Date.parse('2026-10-27T08:00:00+08:00')).food,80);
 assert.equal(accrue({...s,lastAccrual:Date.parse('2026-10-24T00:00:00+08:00')},Date.parse('2026-10-26T07:00:00+08:00')).food,60);
 assert.equal(accrue({...s,food:199,lastAccrual:start},start+3600000).food,200);
});

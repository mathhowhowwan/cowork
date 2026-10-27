import settings from '../config/game-settings.json' with { type: 'json' };
export { settings };
export const questions = [
 {id:'q1',unit:'一元一次方程式',math:'3x+5=20',text:'解出方程式中的 x。',options:['3','5','7','15'],correct:1,explanation:'兩邊先減 5，得到 3x = 15；再除以 3，所以 x = 5。'},
 {id:'q2',unit:'乘法公式',math:'(x+3)^2',text:'展開後，哪個式子正確？',options:['x² + 9','x² + 3x + 9','x² + 6x + 9','2x + 6'],correct:2,explanation:'利用 (a+b)² = a² + 2ab + b²，中間項為 2 × x × 3 = 6x。'},
 {id:'q3',unit:'平方根',math:'\\sqrt{144}',text:'這個數的值是多少？',options:['12','72','14','±12'],correct:0,explanation:'12 × 12 = 144。根號表示非負的平方根，因此答案是 12。'},
 {id:'q4',unit:'畢氏定理',math:'a=3,\\quad b=4',text:'直角三角形兩股長如上，斜邊長是多少？',options:['6','7','25','5'],correct:3,explanation:'斜邊平方 = 3² + 4² = 25，因此斜邊長為 5。'},
 {id:'q5',unit:'等差數列',math:'2,5,8,11,\\ldots',text:'這個等差數列的第 6 項是多少？',options:['14','17','20','16'],correct:1,explanation:'每次增加 3，第 6 項 = 2 + (6−1) × 3 = 17。'}
];
export function initialState(){return {version:1,food:settings.resources.initial.food,knowledge:0,levels:Object.fromEntries(['farm','residence','academy'].map(k=>[k,settings.buildings[k].initialLevel])),answers:{},claimed:[],logs:[],lastAccrual:Date.now(),daily:{date:'',earned:0}};}
export function capacity(s){return settings.buildings.residence.foodCapacityByLevel[s.levels.residence-1];}
export function accrue(s,now=Date.now()) { // Prototype clock: fixed UTC+8, weekday core intervals.
 const start=Math.max(s.lastAccrual,now-366*86400000); let milliseconds=0;
 for(let day=Math.floor((start+28800000)/86400000);day<=Math.floor((now+28800000)/86400000);day++){
  const weekday=new Date(day*86400000).getUTCDay();
  if(settings.schedule.weekdayCore.days.includes(weekday)) milliseconds+=Math.max(0,Math.min(now,day*86400000-28800000+17*3600000)-Math.max(start,day*86400000-28800000+7*3600000));
 }
 return {...s,food:Math.min(capacity(s),s.food+milliseconds/3600000*settings.buildings.farm.foodPerCoreHourByLevel[s.levels.farm-1]),lastAccrual:now};
}
export function answer(s,q,index,now=Date.now()){
 if(s.answers[q.id]!==undefined)return s;
 const date=new Date(now+28800000).toISOString().slice(0,10);const daily=s.daily.date===date?s.daily:{date,earned:0};
 const reward=index===q.correct&&!s.claimed.includes(q.id)?Math.min(settings.learning.firstCorrectKnowledgeReward,settings.resources.knowledge.dailyCap-daily.earned):0;
 return {...s,answers:{...s.answers,[q.id]:index},knowledge:s.knowledge+reward,claimed:reward?[...s.claimed,q.id]:s.claimed,daily:{date,earned:daily.earned+reward},logs:[{text:`${q.unit}：${index===q.correct?'答對了':'完成練習'}${reward?`，知識石 +${reward}`:''}`,time:now},...s.logs].slice(0,30)};
}
export function upgrade(s,key){
 const cost=settings.buildings[key]?.upgradeCostByTargetLevel[s.levels[key]+1];
 if(!cost||s.food<cost.food||s.knowledge<cost.knowledge)return s;
 return {...s,food:s.food-cost.food,knowledge:s.knowledge-cost.knowledge,levels:{...s.levels,[key]:s.levels[key]+1},logs:[{text:`${{farm:'農田',residence:'民居',academy:'書院'}[key]}升至 Lv.${s.levels[key]+1}`,time:Date.now()},...s.logs].slice(0,30)};
}

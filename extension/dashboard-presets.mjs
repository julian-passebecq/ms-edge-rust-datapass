// Per-mode layouts. No external data and no automatic browser navigation.
export const MODE_LABELS={
  custom:"Mes cartes",morning:"Matin",deep:"Deep Work",evening:"Soir"
};
export const MODE_DESCRIPTIONS={
  custom:"Disposition personnelle conservée depuis la V0.2.",
  morning:"Informations du jour, norsk, sport et attention.",
  deep:"Reprendre les projets, comprendre les CI et observer le PC.",
  evening:"Foot, F1, séries, jeux et détente."
};
const VISIBLE={
  morning:["attention","norsk","tech-no","bbc-world","city","f1","gmail","quick"],
  deep:["resume","pulse","system","attention","repos","quota","quick","tech-no","discover"],
  evening:["city","f1","netflix","mentalist","gaming","bbc-world","quick"]
};
export function modeDefaultCards(mode,catalog){
  const picked=VISIBLE[mode]||catalog.map(c=>c.id);
  const order=[...picked,...catalog.map(c=>c.id).filter(id=>!picked.includes(id))];
  return order.map((id,i)=>{
    const def=catalog.find(c=>c.id===id);
    return {id,visible:picked.includes(id),span:def?.span||1,order:i};
  });
}
export function normalizeCards(raw,catalog,fallback){
  const source=Array.isArray(raw)?raw:[];
  const entries=new Map(source.filter(item=>item&&typeof item==="object").map(item=>[item.id,item]));
  const savedOrders=source.map(item=>item?.order).filter(v=>Number.isSafeInteger(v)&&v>=0);
  const appendAfter=savedOrders.length?Math.max(...savedOrders)+1:0;
  const defaults=new Map(fallback.map(item=>[item.id,item]));
  return catalog.map((def,i)=>{
    const origin=defaults.get(def.id)||{id:def.id,visible:true,span:def.span,order:i};
    const entry=entries.get(def.id);
    return {
      id:def.id,
      visible:entry?entry.visible!==false:origin.visible,
      span:entry&&[1,2,3].includes(entry.span)?entry.span:origin.span,
      order:entry&&Number.isSafeInteger(entry.order)&&entry.order>=0&&entry.order<=10000?
        entry.order:(source.length?appendAfter+i:origin.order)
    };
  }).sort((a,b)=>a.order-b.order).map((item,index)=>({...item,order:index}));
}
export function currentCards(state){
  return state.mode==="custom"?state.cards:(state.modeLayouts?.[state.mode]||state.cards);
}
export function replaceCurrentCards(state,cards){
  const mode=state.mode;
  if(mode==="custom")return {...state,cards};
  return {...state,modeLayouts:{...state.modeLayouts,[mode]:cards}};
}
export function resetCurrentCards(state,catalog){
  const defaults=modeDefaultCards(state.mode,catalog);
  return replaceCurrentCards(state,defaults);
}

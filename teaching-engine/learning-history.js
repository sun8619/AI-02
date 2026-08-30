(function(root) {
  const key="lezhi-learning-history-v1", day=86400000;
  function read() {
    try {
      const rows=JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(rows) ? rows.filter(r=>r && typeof r.topic==="string" && Number.isFinite(r.at) && r.at>Date.now()-90*day).slice(-200) : [];
    } catch { return []; }
  }
  function record(entry) {
    // No recordings, transcripts, names, or provider credentials in persistent history.
    const row={topic:String(entry.topic),title:String(entry.title),volume:String(entry.volume || ""),at:Date.now(),outcome:entry.passed ? "passed" : entry.completed===false ? "incomplete" : "review",independent:Math.max(0,Number(entry.independent)||0),assisted:Math.max(0,Number(entry.assisted)||0),seconds:Math.min(3600,Math.max(0,Number(entry.seconds)||0)),voice:{accepted:Math.max(0,entry.voice?.accepted||0),uncertain:Math.max(0,entry.voice?.uncertain||0)}};
    try {localStorage.setItem(key,JSON.stringify([...read(),row].slice(-200)));return true;} catch {return false;}
  }
  function summary(days) {
    const rows=read().filter(r=>r.at>=Date.now()-days*day);
    return {sessions:rows.length,independent:rows.reduce((s,r)=>s+r.independent,0),assisted:rows.reduce((s,r)=>s+r.assisted,0),minutes:Math.round(rows.reduce((s,r)=>s+r.seconds,0)/60)};
  }
  function due() {
    const latest=new Map(); for(const row of read()) latest.set(row.topic,row);
    return [...latest.values()].filter(r=>r.outcome==="review" || Date.now()-r.at>=day).sort((a,b)=>a.at-b.at);
  }
  function trends(rows=read()) {
    const groups=new Map();
    for(const row of [...rows].sort((a,b)=>a.at-b.at)) {if(!groups.has(row.topic))groups.set(row.topic,[]);groups.get(row.topic).push(row);}
    return [...groups].map(([topic,history])=>{
      const completed=history.filter(r=>r.outcome!=="incomplete");
      const delayed=[];
      for(let i=1;i<completed.length;i++) if(completed[i].at-completed[i-1].at>=day) delayed.push(completed[i]);
      const distinctPassDays=new Set(delayed.filter(r=>r.outcome==="passed").map(r=>new Date(r.at).toLocaleDateString())).size;
      const latest=history.at(-1), lastCompleted=completed.at(-1);
      const status=lastCompleted?.outcome==="review" ? "需要再练" : distinctPassDays>=2 ? "多次隔日通过" : delayed.at(-1)?.outcome==="passed" ? "隔日复测通过" : lastCompleted?.outcome==="passed" ? "本次通过，待隔日复测" : "练习未完成";
      const metric=items=>{const independent=items.reduce((s,r)=>s+r.independent,0),assisted=items.reduce((s,r)=>s+r.assisted,0),accepted=items.reduce((s,r)=>s+(r.voice?.accepted||0),0),uncertain=items.reduce((s,r)=>s+(r.voice?.uncertain||0),0);return {help:independent+assisted ? Math.round(100*assisted/(independent+assisted)) : null,voice:accepted+uncertain ? Math.round(100*accepted/(accepted+uncertain)) : null};};
      const now=Date.now(),current=metric(history.filter(r=>now-r.at<7*day)),previous=metric(history.filter(r=>now-r.at>=7*day && now-r.at<14*day));
      return {topic,title:latest.title,volume:latest.volume || "",status,delayedCount:delayed.length,delayedPassed:delayed.filter(r=>r.outcome==="passed").length,current,previous,history};
    });
  }
  root.LezhiHistory={read,record,summary,due,trends,clear(){try{localStorage.removeItem(key);return true;}catch{return false;}}};
})(window);

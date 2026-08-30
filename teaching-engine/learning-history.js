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
    const row={topic:String(entry.topic),title:String(entry.title),at:Date.now(),outcome:entry.passed ? "passed" : "review",independent:Math.max(0,Number(entry.independent)||0),assisted:Math.max(0,Number(entry.assisted)||0),seconds:Math.min(3600,Math.max(0,Number(entry.seconds)||0)),voice:{accepted:Math.max(0,entry.voice?.accepted||0),uncertain:Math.max(0,entry.voice?.uncertain||0)}};
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
  root.LezhiHistory={read,record,summary,due,clear(){try{localStorage.removeItem(key);return true;}catch{return false;}}};
})(window);

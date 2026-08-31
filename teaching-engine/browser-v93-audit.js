async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{speakCurrentMessage=()=>{};LezhiHistory.clear();});
  const result={keyboardTurns:0,visualStates:0,pickerStates:0,errors:[]};
  const items=await page.evaluate(()=>lessons.flatMap((l,i)=>getLessonQuestionBank(l).filter(q=>q.visualModel).map(q=>({i,id:q.id,family:inferActiveQuestionFamily(l,q)}))));
  for(const [width,height] of [[320,568],[375,667],[768,1024],[1024,768],[1433,738],[1920,1080],[844,390]]) {
    await page.setViewportSize({width,height});
    for(const q of items)for(const hint of [false,true]) {
      await page.evaluate(({q,hint})=>{
        state.view="child";changeLesson("audit",q.i);activateLessonQuestion(currentLesson(),getLessonQuestionBank(currentLesson()).find(x=>x.id===q.id));
        state.showKeyboard=false;state.showLessonPicker=false;render();if(hint)showCurrentStepVisual();
      },{q,hint});
      const errors=await page.evaluate(()=>{
        const errors=[],q=currentLesson().activeQuestion;
        const figures=[...document.querySelectorAll("[data-visual-choice]")],buttons=[...document.querySelectorAll("[data-choice-label]")];
        const board=document.querySelector(".kid-board-fallback").getBoundingClientRect();
        if(figures.map(e=>e.dataset.visualChoice).join()!==q.choices.map(c=>c.label).join())errors.push("candidate labels");
        if(buttons.map(e=>e.dataset.choiceLabel).join()!==q.choices.map(c=>c.label).join())errors.push("button labels");
        if(document.documentElement.scrollWidth>innerWidth+1 || document.documentElement.scrollHeight>innerHeight+1)errors.push("page overflow");
        for(const e of figures) {
          const svg=e.querySelector("svg"),caption=e.querySelector("figcaption"),r=svg.getBoundingClientRect(),c=caption.getBoundingClientRect();
          if(r.height<20||r.width<20||caption.scrollWidth>caption.clientWidth+1)errors.push("tiny/clipped candidate");
          if(r.bottom>c.top+1)errors.push("picture overlaps label");
          if(r.top<board.top-1 || c.bottom>board.bottom+1)errors.push("candidate outside visible board");
          if(parseFloat(getComputedStyle(caption).fontSize)<14)errors.push("small candidate label");
        }
        const host=document.querySelector(".kid-board-fallback");
        if(host.scrollWidth>host.clientWidth+1)errors.push("board horizontal overflow");
        if(innerWidth>=1000 && innerHeight>=600 && host.scrollHeight>host.clientHeight+1)errors.push("desktop choice drawing clipped");
        return errors;
      });
      result.visualStates++;result.errors.push(...errors.map(e=>`${width}x${height}/${q.id}/${hint}: ${e}`));
      if([375,1433].includes(width) && q.id.endsWith("-T"))await page.screenshot({path:`output/playwright/v93-${width}-${q.family}-${hint ? 'hint' : 'normal'}.png`});
    }
    await page.evaluate(()=>{state.showLessonPicker=true;render();});
    for(const grade of await page.locator('[data-action="filter-lessons"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.grade))) {
      await page.locator(`[data-action="filter-lessons"][data-grade="${grade}"]`).click();
      const errors=await page.evaluate(()=>{
        const errors=[];
        for(const e of document.querySelectorAll(".lesson-option span,.lesson-option strong,.lesson-option small")) {
          if(parseFloat(getComputedStyle(e).fontSize)<14)errors.push("picker text below 14px");
          if(e.scrollWidth>e.clientWidth+1)errors.push("picker text overflow");
        }
        return errors;
      });
      result.pickerStates++;result.errors.push(...errors.map(e=>`${width}x${height}/${grade}: ${e}`));
    }
  }
  await page.setViewportSize({width:1433,height:738});
  for(const mode of ["whole","guided","remediation","assessment"]) {
    await page.evaluate(mode=>{
      changeLesson("audit",defaultLessonIndex);
      if(mode==="guided"){state.initialWholeQuestion=false;state.phase="guiding";}
      if(mode==="remediation")evaluateLocally("999角","typed");
      if(mode==="assessment")startWholeQuestionAssessment(currentLesson(),"typed");
      state.visualHelpActive=true;render();
    },mode);
    const snapshot=()=>page.evaluate(()=>JSON.stringify({id:currentLesson().activeQuestion.id,phase:state.phase,steps:state.completedSteps,help:state.visualHelpActive,evidence:state.evidence,repair:state.remediationCheck,passed:state.passedQuestionIds,assisted:state.assistedQuestionIds}));
    const before=await snapshot();
    await page.locator('[data-action="toggle-keyboard"]').click();
    for(const text of ["今天天气很好","我不会游泳","我家有三个人","因为"]) {
      await page.locator('[name="answer"]').fill(text);
      await page.locator('[name="answer"]').press("Enter");
      if(before!==await snapshot())result.errors.push(`${mode}: keyboard changed learning for ${text}`);
      result.keyboardTurns++;
    }
    await page.locator('[name="answer"]').fill(await page.evaluate(()=>currentAnswerQuestion().answer));
    await page.locator('[name="answer"]').press("Enter");
    if(before===await snapshot())result.errors.push(`${mode}: correct answer failed to advance`);
  }
  const duration=await page.evaluate(()=>{
    LezhiHistory.clear();for(let i=0;i<10;i++)LezhiHistory.record({topic:"fixture",title:"验收数据",seconds:20,completed:false});
    const html=renderLearningHistory();LezhiHistory.clear();return html.includes("3分20秒")&&!html.includes("0分钟");
  });
  if(!duration)result.errors.push("history duration display");
  await page.evaluate(()=>{LezhiHistory.clear();changeLesson("audit",defaultLessonIndex);state.showKeyboard=false;state.showLessonPicker=false;render();});
  return result;
}

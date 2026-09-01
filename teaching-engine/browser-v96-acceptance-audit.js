async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{speakCurrentMessage=()=>{};LezhiHistory.clear();});
  const result={activeHistory:true,nonEmptyTurns:0,observationQuestions:0,viewports:0,errors:[]};

  const visibleShell=async label=>{
    const errors=await page.evaluate(()=>{
      const shell=document.querySelector(".kid-classroom"),workspace=document.querySelector(".kid-workspace");
      const list=[];
      if(!shell || !workspace)list.push("child shell missing");
      else {
        const bounds=workspace.getBoundingClientRect();
        if(bounds.width<100 || bounds.height<100)list.push("child workspace blank");
        if(document.body.textContent.trim().length<20)list.push("page text blank");
      }
      return list;
    });
    result.errors.push(...errors.map(error=>`${label}: ${error}`));
  };

  await page.evaluate(()=>{
    changeLesson("audit",defaultLessonIndex);LezhiHistory.clear();
    state.sessionId="browser-active-session";state.sessionStartedAt=Date.now()-301000;state.lastStudentText="二十九";state.responseTimesMs=[4000,6000];state.historyRecorded=false;
    saveLearningSession(false);state.view="parent";render();
  });
  if(await page.locator(".learning-history").count()!==1)result.errors.push("active history view missing");
  if(!/今天 5分/.test(await page.locator(".history-today").innerText()))result.errors.push("active five-minute session still displays as zero");
  if(await page.locator(".history-heatmap > div").count()!==42)result.errors.push("knowledge status grid is not 42 topics");
  await page.evaluate(()=>{state.passedQuestionIds=[currentLesson().activeQuestion.id];state.teachingState="MASTERED";state.phase="summary";saveLearningSession(true);});
  if(await page.evaluate(()=>LezhiHistory.read().length)!==1)result.errors.push("active and final save created duplicate history rows");
  await page.screenshot({path:"output/playwright/v96-parent-progress.png",fullPage:true});

  for(const [index,text] of ["今天天气很好","我太笨了","我生气了","老师你是谁","学这个有什么用","我想喝水","我回来了","我不会","换一道简单的","二十九"].entries()) {
    await page.evaluate(({index,text})=>{state.view="child";changeLesson("audit",index%lessons.length);handleChildInput(text,"typed");render();},{index,text});
    await visibleShell(`non-empty ${text}`);result.nonEmptyTurns++;
  }

  await page.evaluate(()=>{state.view="child";changeLesson("audit",defaultLessonIndex);for(let i=0;i<6;i++)handleChildInput("我不会","typed");render();});
  const bounded=await page.evaluate(()=>({teachingState:state.teachingState,choices:state.coach.choices,repair:Boolean(state.remediationCheck)}));
  if(bounded.teachingState!=="REVIEW_LATER" || !bounded.choices || bounded.repair)result.errors.push("continuous inability did not end in a bounded review choice");

  const observations=await page.evaluate(()=>{
    const lessonIndex=lessons.findIndex(lesson=>lesson.sourceQuestionBankId==="G2V1-U5-KP01"),lesson=lessons[lessonIndex];
    return getLessonQuestionBank(lesson).filter(question=>question.visualModel?.kind==="observation").map(question=>({lessonIndex,id:question.id,answer:question.answer,view:question.visualModel.view}));
  });
  if(observations.length!==7)result.errors.push(`observation candidate count ${observations.length}, expected 7`);
  for(const fixture of observations) {
    const inspection=await page.evaluate(fixture=>{
      state.view="child";changeLesson("audit",fixture.lessonIndex);
      const question=getLessonQuestionBank(currentLesson()).find(item=>item.id===fixture.id);
      activateLessonQuestion(currentLesson(),question);state.showLessonPicker=false;state.visualHelpActive=false;render();
      const target=document.querySelector('.math-object-scene figure:nth-child(2) [data-object-view]');
      const choices=[...document.querySelectorAll('[data-visual-choice]')];
      return {target:target?.dataset.objectView || "",choiceCount:choices.length,labels:choices.map(node=>node.dataset.visualChoice).join(""),answer:question.answer,view:question.visualModel.view,blank:!document.querySelector('.kid-board-fallback')?.textContent.trim()};
    },fixture);
    if(inspection.target!==fixture.view)result.errors.push(`${fixture.id}: target view ${inspection.target} != ${fixture.view}`);
    if(inspection.choiceCount!==3 || inspection.labels!=="ABC")result.errors.push(`${fixture.id}: visual choices incomplete`);
    if(inspection.blank)result.errors.push(`${fixture.id}: visual board blank`);
    result.observationQuestions++;
  }
  await page.screenshot({path:"output/playwright/v96-observation.png"});

  const shapeHelp=await page.evaluate(()=>{
    const lessonIndex=lessons.findIndex(lesson=>lesson.sourceQuestionBankId==="G1V1-U3-KP01");
    state.view="child";changeLesson("audit",lessonIndex);const question=currentLesson().activeQuestion;
    const snapshot=()=>[...document.querySelectorAll('[data-visual-choice]')].map(node=>`${node.dataset.visualChoice}:${node.querySelector('svg')?.getAttribute('aria-label') || ''}`).join("|");
    const before=snapshot();
    showCurrentStepVisual();
    const after=snapshot();
    return {id:question.id,before,after,active:state.visualHelpActive,count:document.querySelectorAll('[data-visual-choice]').length,family:inferActiveQuestionFamily(currentLesson(),question)};
  });
  if(shapeHelp.family!=="shape" || !shapeHelp.active || shapeHelp.count!==4 || shapeHelp.before!==shapeHelp.after)result.errors.push("solid-shape help lost or changed the current A/B/C/D candidates");

  for(const [width,height] of [[320,568],[375,667],[768,1024],[1024,768],[1433,738],[1920,1080],[844,390]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>{state.view="child";changeLesson("audit",defaultLessonIndex);state.showKeyboard=true;render();});
    const errors=await page.evaluate(()=>{
      const errors=[];
      if(document.documentElement.scrollWidth>innerWidth+1 || document.documentElement.scrollHeight>innerHeight+1)errors.push("page overflow");
      for(const selector of ['.kid-workspace','.kid-teacher-large','.kid-speech-bubble','.kid-board-card','[name="answer"]']) {
        const node=document.querySelector(selector);if(!node){errors.push(selector+": missing");continue;}
        const box=node.getBoundingClientRect();
        if(box.width<1 || box.height<1 || box.left<-.5 || box.right>innerWidth+1 || box.top<-.5 || box.bottom>innerHeight+1)errors.push(selector+": outside viewport");
        if(node.scrollHeight>node.clientHeight+2 && getComputedStyle(node).overflowY==="hidden")errors.push(selector+": hidden content");
      }
      return errors;
    });
    result.errors.push(...errors.map(error=>`${width}x${height}: ${error}`));result.viewports++;
  }
  await page.evaluate(()=>{LezhiHistory.clear();state.view="child";changeLesson("audit",defaultLessonIndex);render();});
  return result;
}

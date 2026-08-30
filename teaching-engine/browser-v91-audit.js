async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  const findings=[],results=[];
  await page.evaluate(()=>{speakCurrentMessage=()=>{};});
  for(const [width,height] of [[1433,738],[1920,1080],[1024,768],[768,1024],[390,844],[375,667],[320,568],[844,390]]) {
    await page.setViewportSize({width,height});
    for(const mode of ["initial","long","keyboard","confirm","choices","picker"]) {
      await page.evaluate((mode)=>{
        state.view="child";state.showKeyboard=false;state.showLessonPicker=false;
        changeLesson("audit",defaultLessonIndex);
        if(mode==="long" || mode==="keyboard") state.aiMessage="从这道题里的两元开始想，一元能换成十角。把每一元都换成角，再把原来的三角加上。".repeat(5)+"一共是几角？";
        if(mode==="keyboard") state.showKeyboard=true;
        if(mode==="confirm") processVoiceTranscript("二十角",{confidence:.25});
        if(mode==="choices") changeLesson("audit",lessons.findIndex(l=>l.sourceQuestionBankId==="G1V1-U3-KP01"));
        if(mode==="picker") state.showLessonPicker=true;
        render();
      },mode);
      const measured=await page.evaluate((mode)=>{
        const errors=[];
        const rect=s=>document.querySelector(s)?.getBoundingClientRect();
        const visible=e=>e.getClientRects().length && getComputedStyle(e).visibility!=="hidden";
        if(document.documentElement.scrollWidth>innerWidth+1 || document.documentElement.scrollHeight>innerHeight+1) errors.push("outer overflow");
        for(const s of [".kid-topbar",".kid-speech-bubble",".kid-primary-voice",".kid-type-trigger",".kid-help-row",".kid-current-problem",".kid-think-box",...(mode==="keyboard" ? [".keyboard-composer input",".keyboard-composer button"] : [])]) {
          const r=rect(s); if(!r)continue;
          if(r.width<1 || r.height<1 || r.x < -1 || r.right>innerWidth+1 || r.y < -1 || r.bottom>innerHeight+1)errors.push(s+" out of viewport");
        }
        const speech=rect(".kid-speech-bubble"),input=rect(".kid-input-panel");
        if(speech && input && speech.bottom>input.top+1) errors.push("speech/input overlap");
        for(const e of document.querySelectorAll(".kid-topbar button,.kid-input-panel button,.kid-help-row button,.kid-board-ribbon")) {
          if(!visible(e))continue;const r=e.getBoundingClientRect();
          if(r.width<43.9 || r.height<43.9) errors.push("small target: "+e.textContent.trim());
        }
        const stage=rect(".kid-board-fallback"),picture=rect(".question-model-visual");
        if(stage && picture && picture.top<stage.top-1)errors.push("picture clipped at start");
        return {errors,teacherImage:document.querySelector(".kid-teacher-large img")?.complete};
      },mode);
      for(const error of measured.errors)findings.push(`${width}x${height}/${mode}: ${error}`);
      results.push({width,height,mode,passed:!measured.errors.length});
      if(mode==="initial" || ((width===375 || width===1433) && mode==="confirm")) await page.screenshot({path:`output/playwright/v91-final-${width}x${height}-${mode}.png`});
    }
  }
  await page.setViewportSize({width:1433,height:738});
  const visuals=await page.evaluate(()=>{
    const errors=[];let scenes=0;
    for(let i=0;i<lessons.length;i++) {
      changeLesson("audit",i);
      for(const q of getLessonQuestionBank(currentLesson())) {
        activateLessonQuestion(currentLesson(),q);
        for(const help of [false,true]) {
          state.visualHelpActive=help;render();scenes++;
          const e=document.querySelector(".question-model-visual");
          if(!e || !e.innerHTML.trim() || /NaN|undefined/.test(e.innerHTML))errors.push(q.id+": invalid scene");
          if(e?.dataset.questionId!==q.id)errors.push(q.id+": stale question id");
        }
      }
    }
    return {scenes,errors};
  });
  findings.push(...visuals.errors);
  await page.evaluate(()=>{changeLesson("audit",defaultLessonIndex);state.showLessonPicker=false;state.showKeyboard=false;render();});
  await page.getByRole("button",{name:"打字回答",exact:true}).click();
  await page.locator(".kid-keyboard-wrap input").fill("23角");
  await page.locator(".kid-keyboard-wrap form").evaluate(form=>form.requestSubmit());
  const advanced=await page.evaluate(()=>state.assessmentMode && !state.remediationCheck);
  if(!advanced)findings.push("typed correct answer did not advance");
  await page.getByRole("button",{name:"老师把当前问题再拆小一步"}).click();
  await page.waitForFunction(()=>Boolean(state.remediationCheck));
  const repair=await page.evaluate(()=>({prompt:state.remediationCheck.checkPrompt, explanation:state.remediationCheck.explanation,independent:state.passedQuestionIds.length}));
  if(!repair.prompt || !repair.explanation || repair.independent) findings.push("help flow invalid");
  await page.screenshot({path:"output/playwright/v91-final-remediation.png"});
  await page.getByRole("button",{name:"家长进展",exact:true}).click();
  if(!await page.getByRole("heading",{name:"学习记录",exact:true}).isVisible())findings.push("parent history inaccessible");
  return {cases:results.length,visualScenes:visuals.scenes,findings,repair};
}

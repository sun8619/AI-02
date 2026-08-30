async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{speakCurrentMessage=()=>{};LezhiHistory.clear();});
  await page.setViewportSize({width:1280,height:800});
  const result={choiceClicks:0,choiceErrors:[],visualSteps:0,visibleHints:0,hiddenHints:[],visualErrors:[],layoutErrors:[],layoutStates:0};
  const options=await page.evaluate(()=>lessons.flatMap((l,i)=>getLessonQuestionBank(l).filter(q=>q.choices.length).map(q=>({i,id:q.id,choices:q.choices.map(c=>({label:c.label,correct:LezhiAnswers.whole(c.text,q)}))}))));
  for(const q of options) for(const choice of q.choices) {
    await page.evaluate(({i,id})=>{changeLesson("audit",i);activateLessonQuestion(currentLesson(),getLessonQuestionBank(currentLesson()).find(q=>q.id===id));render();},q);
    await page.locator(`[data-action="answer-choice"][data-choice-label="${choice.label}"]`).click();
    result.choiceClicks++;
    if(!await page.evaluate(expected=>Boolean(state.assessmentMode && !state.remediationCheck)===expected,choice.correct)) result.choiceErrors.push(q.id+":"+choice.label);
    const consistency=await page.evaluate(()=>{
      const q=state.remediationCheck?.answerQuestion || currentLesson().activeQuestion;
      const labels=(q.choices||[]).map(c=>c.label);
      const buttons=[...document.querySelectorAll("[data-choice-label]")].map(e=>e.dataset.choiceLabel).filter(Boolean);
      const pictures=[...document.querySelectorAll("[data-visual-choice]")].map(e=>e.dataset.visualChoice);
      return !labels.length || (labels.join()===buttons.join() && (!pictures.length || labels.join()===pictures.join()));
    });
    if(!consistency)result.choiceErrors.push(q.id+": remedial candidate mismatch");
  }
  const visual=await page.evaluate(()=>{
    const errors=[],hidden=[];let steps=0,available=0;
    const board=document.querySelector(".kid-board-fallback");
    const fingerprint=element=>JSON.stringify([...element.querySelectorAll("*")].map(e=>{
      const s=getComputedStyle(e),r=e.getBoundingClientRect();
      return [e.tagName,e.childElementCount ? "" : e.textContent,s.display,s.color,s.backgroundColor,s.fill,s.stroke,s.outlineStyle,s.outlineColor,s.outlineWidth,r.width,r.height,e.getAttribute("d"),e.getAttribute("x1"),e.getAttribute("x2")];
    }));
    const host=document.createElement("div");host.className="question-model-visual";host.style.cssText="width:320px;max-width:320px;position:fixed;left:0;top:0;background:white;max-height:none;z-index:100;";board.append(host);
    for(let i=0;i<lessons.length;i++) {
      const l=lessons[i];
      state.lessonIndex=i;state.initialWholeQuestion=false;state.assessmentMode=false;state.phase="guiding";
      for(const q of getLessonQuestionBank(l)) {
        activateLessonQuestion(l,q);state.remediationCheck=null;
        createGuidedSteps(l).forEach((p,index)=>{
          state.completedSteps=index;state.visualHelpActive=false;
          const v=createActiveVisualLesson(l),payload={question:v.activeQuestion,family:inferActiveQuestionFamily(v)};
          const help=LezhiQuestionVisuals.help(payload);steps++;
          host.innerHTML=LezhiQuestionVisuals.render({...payload,mode:"question"});const before=fingerprint(host);
          const normalLabels=[...host.querySelectorAll("[data-visual-choice]")].map(e=>e.dataset.visualChoice).join();
          if(host.scrollWidth>322)errors.push(q.id+":"+index+": normal overflow");
          host.innerHTML=LezhiQuestionVisuals.render({...payload,mode:"hint"});
          if(help) {available++;if(before===fingerprint(host))errors.push(q.id+":"+index+": no computed visual change");}else hidden.push({id:q.id,step:p.label});
          if(host.scrollWidth>322)errors.push(q.id+":"+index+": hint overflow");
          if(normalLabels!==[...host.querySelectorAll("[data-visual-choice]")].map(e=>e.dataset.visualChoice).join())errors.push(q.id+": candidates changed on hint");
          if(/NaN|undefined/.test(host.innerHTML))errors.push(q.id+": invalid visual");
        });
      }
    }
    host.remove();return {errors,hidden,steps,available};
  });
  result.visualSteps=visual.steps;result.visibleHints=visual.available;result.hiddenHints=visual.hidden;result.visualErrors=visual.errors;
  for(const [width,height] of [[320,568],[375,667],[414,896],[768,1024],[1024,768],[1280,720],[1433,738],[1920,1080],[844,390],[375,480]]) {
    await page.setViewportSize({width,height});
    for(const mode of ["initial","choices","choice-keyboard","hint","long","confirm","picker"]) {
      await page.evaluate(mode=>{
        state.view="child";state.showKeyboard=false;state.showLessonPicker=false;
        changeLesson("audit",mode.startsWith("choice") || mode==="hint" ? lessons.findIndex(l=>l.sourceQuestionBankId==="G1V1-U3-KP01") : defaultLessonIndex);
        if(mode==="choice-keyboard")state.showKeyboard=true;
        if(mode==="hint")showCurrentStepVisual();
        if(mode==="long")state.aiMessage="先把每一个元换成角，再把原来的几角加上。".repeat(12);
        if(mode==="confirm")processVoiceTranscript("二十角",{confidence:.25});
        if(mode==="picker")state.showLessonPicker=true;
        render();
      },mode);
      const errors=await page.evaluate(()=>{
        const errors=[];
        const rect=s=>{const e=document.querySelector(s);return e?.getClientRects().length ? e.getBoundingClientRect() : null;};
        if(document.documentElement.scrollWidth>innerWidth+1 || document.documentElement.scrollHeight>innerHeight+1)errors.push("outer overflow");
        for(const s of [".kid-speech-bubble",".kid-input-panel",".kid-help-row",".kid-think-box",".kid-current-problem",".kid-board-fallback"]) {const r=rect(s);if(r && (r.width<1 || r.height<1 || r.x< -1 || r.y< -1 || r.right>innerWidth+1 || r.bottom>innerHeight+1))errors.push(s+" out of bounds");}
        const speech=rect(".kid-speech-bubble"),input=rect(".kid-input-panel"),help=rect(".kid-help-row");
        if(speech && input && speech.bottom>input.top+1)errors.push("speech/input overlap");
        if(input && help && input.bottom>help.top+1)errors.push("input/help overlap");
        for(const e of document.querySelectorAll(".kid-current-problem strong")) {
          if(getComputedStyle(e).webkitLineClamp!=="none" || getComputedStyle(e).textOverflow==="ellipsis")errors.push("current problem truncated");
        }
        const canvas=rect(".kid-board-fallback");
        for(const e of document.querySelectorAll("[data-visual-choice] svg")) {
          const r=e.getBoundingClientRect();
          if(r.width<20 || r.height<20)errors.push("candidate picture too small");
          if(innerWidth>=600 && canvas && (r.top<canvas.top-1 || r.bottom>canvas.bottom+1))errors.push("candidate picture clipped");
        }
        for(const e of document.querySelectorAll(".kid-input-panel button,.kid-help-row button")) {
          if(!e.getClientRects().length)continue;const r=e.getBoundingClientRect();if(r.width<43.9 || r.height<43.9)errors.push("small target "+e.textContent);
        }
        return errors;
      });
      result.layoutStates++;result.layoutErrors.push(...errors.map(e=>`${width}x${height}/${mode}: ${e}`));
      if([320,768,1433].includes(width) && ["initial","choices","hint"].includes(mode))await page.screenshot({path:`output/playwright/v92-${width}x${height}-${mode}.png`});
    }
  }
  await page.setViewportSize({width:1433,height:738});
  await page.evaluate(()=>{changeLesson("audit",defaultLessonIndex);state.showKeyboard=false;state.showLessonPicker=false;render();});
  return result;
}

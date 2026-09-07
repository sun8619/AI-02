async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{speakCurrentMessage=()=>{prepareTeacherTurn();};LezhiHistory.clear();});
  await page.setViewportSize({width:1433,height:800});
  const result={wholeSubmissions:0,repairSubmissions:0,pictureSubmissions:0,pictureKeyboardSubmissions:0,pictureWrongSubmissions:0,layoutStates:0,errors:[]};
  const fixtures=await page.evaluate(()=>lessons.flatMap((l,i)=>getLessonQuestionBank(l).map(q=>({i,id:q.id,answer:q.answer,picture:Boolean(q.visualModel),choice:LezhiAnswers.choices(q).find(c=>LezhiAnswers.whole(c.text,q))?.label}))));
  const setup=async fixture=>page.evaluate(({i,id})=>{
    state.view="child";changeLesson("audit",i);
    activateLessonQuestion(currentLesson(),getLessonQuestionBank(currentLesson()).find(q=>q.id===id));
    state.initialWholeQuestion=true;state.showKeyboard=true;state.showLessonPicker=false;
    state.aiMessage=LezhiCoach.task(currentLesson(),coachQuestion(),{},"start",LezhiAnswers.multipart(currentAnswerQuestion())?.instruction||"");
    render();
  },fixture);
  const submit=async text=>{
    await page.locator('[name="answer"]').fill(text);
    await page.locator('[name="answer"]').press("Enter");
  };
  for(const fixture of fixtures) {
    await setup(fixture);
    await submit(fixture.answer);
    const outcome=await page.evaluate(()=>({repair:Boolean(state.remediationCheck),passed:state.passedQuestionIds,initial:state.initialWholeQuestion}));
    if(outcome.repair || (outcome.initial&&!outcome.passed.includes(fixture.id)))result.errors.push(`${fixture.id}: whole typed answer did not advance`);
    result.wholeSubmissions++;
  }
  for(const fixture of fixtures.filter(f=>f.id.endsWith("-T"))) {
    await setup(fixture);
    await submit("我没听懂");
    if(await page.locator('[data-action="teacher-try"]').count()!==1){result.errors.push(`${fixture.id}: missing manual check entry`);continue;}
    const presentation=await page.evaluate(()=>({kind:currentTeacherFrame()?.kind,text:document.querySelector('.kid-speech-bubble p').textContent,example:state.teacherTurn.exampleQuestion.prompt,visible:createActiveVisualLesson(currentLesson()).activeQuestion.prompt}));
    if(presentation.kind!=="explain" || presentation.text.length>60 || presentation.visible!==presentation.example)result.errors.push(`${fixture.id}: explanation/figure mismatch`);
    await page.locator('[data-action="teacher-try"]').click();
    const check=await page.evaluate(()=>state.remediationCheck.answer);
    await submit(check);
    if(await page.evaluate(()=>Boolean(state.remediationCheck)))result.errors.push(`${fixture.id}: typed remedial answer stuck`);
    result.repairSubmissions++;
  }
  for(const fixture of fixtures.filter(f=>f.picture&&f.choice)) {
    await setup(fixture);
    await page.locator(`[data-visual-choice="${fixture.choice}"] button`).click();
    if(await page.evaluate(()=>Boolean(state.remediationCheck)||state.initialWholeQuestion))result.errors.push(`${fixture.id}: picture click did not submit correct choice`);
    result.pictureSubmissions++;
    await setup(fixture);
    await page.locator(`[data-visual-choice="${fixture.choice}"] button`).focus();
    await page.locator(`[data-visual-choice="${fixture.choice}"] button`).press("Enter");
    if(await page.evaluate(()=>Boolean(state.remediationCheck)||state.initialWholeQuestion))result.errors.push(`${fixture.id}: picture keyboard activation did not submit`);
    result.pictureKeyboardSubmissions++;
    await setup(fixture);
    await page.locator(`[data-visual-choice]:not([data-visual-choice="${fixture.choice}"]) button`).first().click();
    if(!await page.evaluate(()=>Boolean(state.remediationCheck)&&currentTeacherFrame()?.kind==="explain"))result.errors.push(`${fixture.id}: wrong picture choice did not start teaching`);
    result.pictureWrongSubmissions++;
  }
  await setup(fixtures.find(f=>f.i===16)||fixtures[0]);
  const input=page.locator('[name="answer"]');
  await input.fill("二十");
  await input.evaluate(node=>node.setSelectionRange(1,1));
  await page.evaluate(()=>render());
  if(await input.inputValue()!=="二十" || !await input.evaluate(node=>node===document.activeElement&&node.selectionStart===1))result.errors.push("draft, focus or caret lost on rerender");
  await submit("");
  if(await page.locator('.keyboard-notice').count()!==1)result.errors.push("empty submit has no persistent inline feedback");
  await input.fill("十");
  if(await page.locator('.keyboard-notice').count())result.errors.push("empty notice not cleared when typing");
  await page.locator('.toast.is-visible').waitFor({state:"hidden",timeout:6000});

  for(const [width,height] of [[320,568],[375,667],[531,724],[768,1024],[1024,768],[1433,738],[1920,1080],[844,390]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>{changeLesson("audit",defaultLessonIndex);state.showKeyboard=false;handleChildInput("我不会","typed");render();});
    for(const mode of ["explain","check","keyboard"]) {
      if(mode==="check")await page.locator('[data-action="teacher-try"]').click();
      if(mode==="keyboard")await page.locator('[data-action="toggle-keyboard"]').click();
      const errors=await page.evaluate(()=>{
        const errors=[];
        if(document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1)errors.push("page overflow");
        for(const selector of [".kid-speech-bubble",".kid-board-card",".kid-primary-voice",".teacher-turn-controls button",'[name="answer"]']) {
          for(const node of document.querySelectorAll(selector)) {
            const b=node.getBoundingClientRect(),s=getComputedStyle(node);
            if(b.width<1||b.height<1||b.right>innerWidth+1||b.bottom>innerHeight+1||b.top<0)errors.push(selector+": outside screen");
            if(node.scrollHeight>node.clientHeight+2&&s.overflowY==="hidden")errors.push(selector+": clipped content");
          }
        }
        return errors;
      });
      result.errors.push(...errors.map(e=>`${width}x${height}/${mode}: ${e}`));result.layoutStates++;
      if([531,1433].includes(width))await page.screenshot({path:`output/playwright/v97-${width}-${mode}.png`});
    }
  }
  await page.evaluate(()=>{LezhiHistory.clear();changeLesson("audit",defaultLessonIndex);render();});
  return result;
}

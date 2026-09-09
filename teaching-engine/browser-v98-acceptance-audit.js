async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{speakCurrentMessage=()=>{prepareTeacherTurn();};LezhiHistory.clear();});
  await page.setViewportSize({width:1433,height:800});
  const result={topicFlows:0,wrongQuestionStarts:0,choiceCandidates:0,layouts:0,errors:[]};
  const setup=async (i,id)=>page.evaluate(({i,id})=>{
    state.view="child";changeLesson("audit",i);
    if(id)activateLessonQuestion(currentLesson(),getLessonQuestionBank(currentLesson()).find(q=>q.id===id));
    state.initialWholeQuestion=true;state.showKeyboard=true;state.showLessonPicker=false;
    state.aiMessage=LezhiCoach.task(currentLesson(),coachQuestion(),{},"start");render();
  },{i,id});
  const submit=async text=>{await page.locator('[name="answer"]').fill(text);await page.locator('[name="answer"]').press("Enter");};
  const fixtures=await page.evaluate(()=>lessons.flatMap((l,i)=>getLessonQuestionBank(l).map(q=>{
    const choices=LezhiAnswers.choices(q),contract=LezhiAnswers.multipart(q);
    const candidates=[...choices.map(c=>c.text),String(q.answer).replace(/\d+/g,v=>String(Number(v)+1)),`不是${q.answer}`,"不对","99999"];
    const wrong=candidates.find(text=>LezhiAnswers.classify(text,q).kind==="answer" && !LezhiAnswers.whole(text,q) && (!contract || LezhiAnswers.readParts(text,contract)?.complete));
    return {i,id:q.id,choices,wrong};
  })));

  // Submit a genuinely wrong answer, rather than equating a variation preview to an attempted question.
  for(const fixture of fixtures) {
    if(!fixture.wrong)throw new Error(`${fixture.id}: no complete wrong-answer fixture`);
    await setup(fixture.i,fixture.id);await submit(fixture.wrong);
    const visible=await page.evaluate(()=>({kind:currentTeacherFrame()?.kind,text:document.querySelector('.kid-speech-bubble p')?.textContent,question:createActiveVisualLesson(currentLesson()).activeQuestion.prompt,example:state.teacherTurn?.exampleQuestion.prompt,original:document.querySelector('.kid-task-main strong')?.textContent}));
    if(visible.kind!=="explain" || visible.text.length>60 || visible.question!==visible.example || !visible.original)result.errors.push(`${fixture.id}: wrong answer not followed by bound short teaching`);
    result.wrongQuestionStarts++;
  }
  for(let i=0;i<42;i++) {
    const starter=fixtures.find(f=>f.i===i && f.id.endsWith("-T"));
    await setup(i,starter.id);await submit(starter.wrong);
    const example=await page.evaluate(()=>createActiveVisualLesson(currentLesson()).activeQuestion.prompt);
    for(const action of ["我想喝水","我准备好了","今天天气真好"])await submit(action);
    if(await page.evaluate(()=>createActiveVisualLesson(currentLesson()).activeQuestion.prompt)!==example)result.errors.push(`${i}: interrupted example changed`);
    await page.locator('[data-action="teacher-resume"]').click();
    if(await page.locator('[data-action="show-visual"]').count()) {
      await page.locator('[data-action="show-visual"]').click();
      await page.locator('[data-action="teacher-resume"]').click();
      if(await page.evaluate(()=>createActiveVisualLesson(currentLesson()).activeQuestion.prompt)!==example)result.errors.push(`${i}: picture aside changed example`);
    }
    await submit("我太笨了");
    if(await page.locator('[data-action="coach-pause"]').count()!==1)result.errors.push(`${i}: missing emotion choice`);
    await submit("我准备好了");
    let turns=0;
    while(!await page.evaluate(()=>state.phase==="summary") && turns++<30) {
      if(await page.locator('[data-action="teacher-try"]').count())await page.locator('[data-action="teacher-try"]').click();
      const answer=await page.evaluate(()=>currentAnswerQuestion().answer);
      await submit(answer);
    }
    const finished=await page.evaluate(()=>({phase:state.phase,passed:state.passedQuestionIds,assisted:state.assistedQuestionIds,teaching:state.teachingState}));
    if(finished.phase!=="summary" || finished.teaching!=="MASTERED" || finished.passed.some(id=>finished.assisted.includes(id)))result.errors.push(`${i}: assisted-to-independent session did not finish honestly`);
    await setup(i);
    for(let j=0;j<6;j++)await submit("我不会");
    if(!await page.evaluate(()=>state.teachingState==="REVIEW_LATER" && state.coach.choices && !state.passedQuestionIds.length))result.errors.push(`${i}: repeated difficulty did not offer review without mastery`);
    result.topicFlows++;
  }
  for(const fixture of fixtures.filter(f=>f.choices.length)) for(const choice of fixture.choices) {
    await setup(fixture.i,fixture.id);
    const expected=await page.evaluate(choice=>LezhiAnswers.whole(choice.text,currentAnswerQuestion()),choice);
    const visual=page.locator(`[data-visual-choice="${choice.label}"] button`);
    if(await visual.count())await visual.click();
    else await page.locator(`.kid-answer-choices [data-choice-label="${choice.label}"]`).click();
    const outcome=await page.evaluate(()=>({repair:Boolean(state.remediationCheck),initial:state.initialWholeQuestion}));
    if(expected ? outcome.repair||outcome.initial : !outcome.repair)result.errors.push(`${fixture.id}/${choice.label}: choice outcome mismatch`);
    result.choiceCandidates++;
  }
  await setup(16);
  await page.locator('[name="answer"]').fill("旧题草稿");
  await page.evaluate(()=>{handleChildInput("换一道简单的","button");render();});
  if(await page.locator('[name="answer"]').inputValue())result.errors.push("old draft carried into a different question");

  for(const [width,height] of [[320,568],[375,667],[531,724],[768,1024],[1024,768],[1433,738],[1920,1080],[844,390]]) {
    await page.setViewportSize({width,height});
    await setup(16);await submit("我不会");
    for(const mode of ["explain","aside","paused","emotion","check"]) {
      if(mode==="aside")await submit("今天天气真好");
      if(mode==="paused")await submit("我想喝水");
      if(mode==="emotion"){await submit("我准备好了");await submit("我太笨了");}
      if(mode==="check"){await submit("我准备好了");await page.locator('[data-action="teacher-try"]').click();}
      const errors=await page.evaluate(()=>{
        const errors=[];
        if(document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1)errors.push("outer overflow");
        for(const selector of ['.teacher-turn-controls button','.kid-primary-voice','[name="answer"]','.kid-help-row button','.kid-task-main']) for(const node of document.querySelectorAll(selector)) {
          if(getComputedStyle(node).display==="none")continue;
          const b=node.getBoundingClientRect();
          if(b.width<1||b.height<1||b.left<0||b.right>innerWidth+1||b.top<0||b.bottom>innerHeight+1)errors.push(`${selector}: off screen`);
          if(node.matches('button,input')) {
            const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
            if(!hit||!node.contains(hit))errors.push(`${selector}: hidden behind another element`);
          }
        }
        return errors;
      });
      result.errors.push(...errors.map(e=>`${width}x${height}/${mode}: ${e}`));result.layouts++;
      if([320,375,768,1433].includes(width))await page.screenshot({path:`output/playwright/v98-${width}-${mode}.png`});
    }
  }
  await page.evaluate(()=>{LezhiHistory.clear();state.view="child";changeLesson("audit",defaultLessonIndex);render();});
  return result;
}

async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{speakCurrentMessage=()=>{};});
  const result={questions:0,keyboardTurns:0,viewports:0,errors:[]};
  const items=await page.evaluate(()=>lessons.flatMap((l,index)=>getLessonQuestionBank(l).filter(q=>LezhiAnswers.multipart(q)).map(q=>({index,id:q.id,answers:LezhiAnswers.multipart(q).slots.map(s=>s.expected)}))));
  const prepare=async item=>{
    await page.evaluate(({index,id})=>{
      state.view="child";changeLesson("audit",index);
      activateLessonQuestion(currentLesson(),getLessonQuestionBank(currentLesson()).find(q=>q.id===id));
      state.initialWholeQuestion=false;state.assessmentMode=true;state.phase="assessment";state.assessmentTargetCount=3;
      state.aiMessage=createLessonStartMessage(currentLesson(),null);state.showKeyboard=false;render();
    },item);
    await page.getByRole("button",{name:"打字回答",exact:true}).click();
  };
  const reply=async text=>{
    await page.locator('[name="answer"]').fill(text);
    await page.locator('[name="answer"]').press("Enter");
    result.keyboardTurns++;
  };
  await page.setViewportSize({width:1433,height:738});
  for(const item of items) {
    await prepare(item);
    for(const [i,text] of item.answers.entries()) {
      await reply(text);
      const stateResult=await page.evaluate(()=>({id:currentLesson().activeQuestion.id,passed:state.passedQuestionIds.slice(),pending:pendingMultipartPrompt(),full:document.querySelector('.kid-current-problem').textContent,bubble:document.querySelector('.kid-speech-bubble').textContent}));
      if(i<item.answers.length-1 && (stateResult.id!==item.id || !stateResult.pending || stateResult.passed.length))result.errors.push(item.id+": partial response failed");
      if(i===item.answers.length-1 && !stateResult.passed.includes(item.id))result.errors.push(item.id+": complete answer failed");
      if(/_{2,}|undefined|NaN/.test(stateResult.full+stateResult.bubble))result.errors.push(item.id+": invalid visible prompt");
    }
    result.questions++;
  }
  const money=items.find(x=>x.id==="G1V2-U5-KP01-V03");
  for(const [width,height] of [[320,568],[375,667],[768,1024],[1024,768],[1433,738],[1920,1080],[844,390]]) {
    await page.setViewportSize({width,height});await prepare(money);
    await reply("一百分");
    const errors=await page.evaluate(()=>{
      const errors=[],main=document.querySelector('.kid-task-main'),bubble=document.querySelector('.kid-speech-bubble');
      if(!main.textContent.includes("又等于多少分"))errors.push("original question missing");
      if(!bubble.textContent.includes("1元是几角？"))errors.push("missing-slot prompt absent");
      if(document.querySelector('.kid-think-box').textContent.trim()!=="1元是几角？")errors.push("board cue disagrees with follow-up");
      if(bubble.textContent.includes("这次只说：几分"))errors.push("single-unit instruction leaked");
      if(!document.querySelector('.kid-board-fallback').textContent.includes("几角？") || !document.querySelector('.kid-board-fallback').textContent.includes("几分？"))errors.push("diagram missing one target");
      if(document.documentElement.scrollWidth>innerWidth+1 || document.documentElement.scrollHeight>innerHeight+1)errors.push("page overflow");
      for(const element of [main,bubble,document.querySelector('[name="answer"]')]) {
        const box=element.getBoundingClientRect();
        if(box.width<1 || box.height<1 || box.left<0 || box.right>innerWidth+1 || box.bottom>innerHeight+1)errors.push("response UI outside viewport");
      }
      return errors;
    });
    result.errors.push(...errors.map(e=>`${width}x${height}: ${e}`));result.viewports++;
    if([375,1433].includes(width))await page.screenshot({path:`output/playwright/v94-${width}-multipart.png`});
    await reply("十角");
    if(!await page.evaluate(()=>state.passedQuestionIds.includes("G1V2-U5-KP01-V03")))result.errors.push(`${width}x${height}: did not advance`);
  }
  await page.evaluate(()=>{LezhiHistory.clear();changeLesson("audit",defaultLessonIndex);});
  return result;
}

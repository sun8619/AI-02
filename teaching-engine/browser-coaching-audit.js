async (page) => {
  await page.reload({waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{speakCurrentMessage=()=>{};});
  const result={topics:0,keyboardTurns:0,viewports:0,errors:[]};
  const prepare=async index=>{
    await page.evaluate(index=>{state.view="child";changeLesson("audit",index);state.showKeyboard=false;render();},index);
    await page.getByRole("button",{name:"打字回答",exact:true}).click();
  };
  const reply=async text=>{
    await page.locator('[name="answer"]').fill(text);
    await page.locator('[name="answer"]').press("Enter");result.keyboardTurns++;
  };
  await page.setViewportSize({width:1433,height:738});
  for(let index=0;index<42;index++) {
    await prepare(index);
    const before=await page.evaluate(()=>JSON.stringify({id:currentLesson().activeQuestion.id,evidence:state.evidence,mastery:state.mastery}));
    await reply("我想喝水");
    if(!await page.getByRole("button",{name:"我准备好了",exact:true}).isVisible())result.errors.push(index+": resume action missing");
    if(await page.evaluate(()=>/[？?]/.test(document.querySelector('.kid-speech-bubble p').textContent)))result.errors.push(index+": pause still demands an answer");
    await page.getByRole("button",{name:"我准备好了",exact:true}).click();
    const after=await page.evaluate(()=>JSON.stringify({id:currentLesson().activeQuestion.id,evidence:state.evidence,mastery:state.mastery}));
    if(before!==after)result.errors.push(index+": pause changed learning progress");
    await reply("太无聊了");
    await page.getByRole("button",{name:"换一道简单的",exact:true}).click();
    if(!await page.evaluate(()=>isWholeQuestionTurn() && !state.coach.choices))result.errors.push(index+": change did not start a whole question");
    await reply("我不会");
    const check=await page.evaluate(()=>({answer:state.remediationCheck?.answer,prompt:state.remediationCheck?.checkPrompt}));
    if(!check.answer)result.errors.push(index+": no remedial question");
    else {
      if(!await page.evaluate(prompt=>state.aiMessage.endsWith(prompt),check.prompt))result.errors.push(index+": speech lost current question");
      await reply(check.answer);
      if(await page.evaluate(()=>Boolean(state.remediationCheck)))result.errors.push(index+": correct check got stuck");
    }
    result.topics++;
  }
  for(const [width,height] of [[320,568],[375,667],[768,1024],[1024,768],[1433,738],[1920,1080],[844,390]]) {
    await page.setViewportSize({width,height});
    // Long, condition-rich text must remain accessible, not clipped to a word limit.
    await prepare(41);await reply("我不会");
    const inspect=async ()=>await page.evaluate(()=>{
      const errors=[];
      if(document.documentElement.scrollWidth>innerWidth+1 || document.documentElement.scrollHeight>innerHeight+1)errors.push("page overflow");
      for(const selector of ['.kid-current-problem','.kid-speech-bubble','[name="answer"]','.kid-help-row']) {
        const el=document.querySelector(selector);if(!el)continue;
        const b=el.getBoundingClientRect();
        if(b.width<1 || b.height<1 || b.x<-.5 || b.right>innerWidth+1 || b.bottom>innerHeight+1)errors.push(selector+": outside viewport");
        if(el.scrollHeight>el.clientHeight+2 && getComputedStyle(el).overflowY==="hidden")errors.push(selector+": content hidden");
      }
      const bubble=document.querySelector('.kid-speech-bubble p');
      const expected=state.coach.paused || state.coach.choices ? state.aiMessage : state.remediationCheck?.checkPrompt || state.aiMessage;
      if(!bubble.textContent.includes(expected))errors.push("teacher text truncated");
      return errors;
    });
    result.errors.push(...(await inspect()).map(e=>`${width}x${height}: ${e}`));
    if([375,768,1433].includes(width))await page.screenshot({path:`output/playwright/v95-${width}-explanation.png`});
    await reply("太无聊了");
    const choices=page.getByRole("button",{name:"换一道简单的",exact:true});
    if(!await choices.isVisible())result.errors.push(`${width}x${height}: choice not visible`);
    await page.getByRole("button",{name:"先休息",exact:true}).click();
    result.errors.push(...(await inspect()).map(e=>`${width}x${height} pause: ${e}`));
    await page.getByRole("button",{name:"我准备好了",exact:true}).click();
    if([375,768,1433].includes(width))await page.screenshot({path:`output/playwright/v95-${width}-coaching.png`});
    result.viewports++;
  }
  await page.evaluate(()=>{LezhiHistory.clear();changeLesson("audit",defaultLessonIndex);});
  return result;
}

async (page) => {
  const errors=[];
  await page.setViewportSize({width:1280,height:800});
  await page.evaluate(()=>{state.view="child";state.showLessonPicker=false;changeLesson("audit",defaultLessonIndex);render();});
  const normal=await page.locator(".question-model-visual").innerHTML();
  await page.locator('[data-action="show-visual"]').click();
  await page.waitForFunction(()=>state.visualHelpActive);
  const hint=await page.locator(".question-model-visual").innerHTML();
  if(normal===hint)errors.push("help click did not change visual");
  await page.getByRole("button",{name:"收起图中提示",exact:true}).click();
  await page.waitForFunction(()=>!state.visualHelpActive);
  if(normal!==await page.locator(".question-model-visual").innerHTML())errors.push("help toggle did not restore question");
  if(!await page.locator('.kid-teacher-large[role="img"]').getAttribute("aria-label"))errors.push("teacher accessible name missing");

  const fixtures=await page.evaluate(()=>{
    const now=Date.now(),day=86400000;
    const points=[lessons[defaultLessonIndex],lessons.find(l=>l.grade!==lessons[defaultLessonIndex].grade)];
    const rows=points.flatMap((l,i)=>[10,3,1].map((days,j)=>({topic:l.sourceQuestionBankId,title:l.node,volume:l.grade,at:now-days*day,outcome:j===1 ? "review" : "passed",independent:j===1 ? 0 : 3,assisted:j===1 ? 2 : 0,seconds:90,voice:{accepted:2,uncertain:1}})));
    localStorage.setItem("lezhi-learning-history-v1",JSON.stringify(rows));
    state.historyRecorded=true;
    return points.map(l=>({topic:l.sourceQuestionBankId,volume:l.grade}));
  });
  await page.getByRole("button",{name:"家长进展",exact:true}).click();
  await page.getByRole("combobox",{name:"册别",exact:true}).selectOption(fixtures[0].volume);
  if(await page.locator(".history-trends details").count()!==1)errors.push("volume filter did not narrow topics");
  await page.getByRole("combobox",{name:"知识点",exact:true}).selectOption(fixtures[0].topic);
  await page.getByRole("combobox",{name:"结果",exact:true}).selectOption("review");
  if(!await page.getByText("最近学习明细（1次）",{exact:true}).isVisible())errors.push("result filter did not narrow sessions");
  await page.locator(".history-trends summary").click();
  if(!await page.getByText("隔日复测通过 1 / 2 次，通过率 50%",{exact:true}).isVisible())errors.push("delayed evidence missing");
  await page.setViewportSize({width:375,height:667});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errors.push("parent history horizontal overflow");
  await page.screenshot({path:"output/playwright/v92-parent-history.png",fullPage:true});
  await page.evaluate(()=>{LezhiHistory.clear();state.historyFilters={};state.view="child";changeLesson("audit",defaultLessonIndex);render();});
  await page.setViewportSize({width:1433,height:738});
  return {errors,historyFilters:3,helpToggle:true,teacherAccessible:true,fixtureNotice:"Synthetic local history only; cleared after test. Not child trial data."};
}

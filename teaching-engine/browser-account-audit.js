async (page) => {
  const errors=[];
  if(!await page.getByRole("heading",{name:"欢迎回来",exact:true}).isVisible())errors.push("login gate missing");
  await page.getByRole("button",{name:"注册",exact:true}).click();
  await page.getByLabel("用户名",{exact:true}).fill(`family_${Date.now()}`);
  await page.getByLabel("孩子称呼",{exact:true}).fill("小星");
  await page.getByLabel("密码",{exact:true}).fill("familyPass123");
  await page.getByLabel("确认密码",{exact:true}).fill("familyPass123");
  await page.getByRole("button",{name:"创建账号",exact:true}).click();
  await page.getByRole("heading",{name:"请保存这组找回码",exact:true}).waitFor({state:"visible",timeout:10000});
  if(!await page.getByRole("heading",{name:"请保存这组找回码",exact:true}).isVisible())errors.push("recovery code checkpoint missing");
  const recovery=await page.locator(".recovery-code").textContent();
  if(!/^[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{8}$/.test(recovery||""))errors.push("recovery code format invalid");
  await page.getByText("我已经把找回码保存在安全的地方",{exact:false}).click();
  await Promise.all([page.waitForLoadState("domcontentloaded"),page.getByRole("button",{name:"进入乐之老师",exact:true}).click()]);
  await page.waitForFunction(()=>window.LezhiAccount?.ready?.() && window.LezhiAccount?.session?.()?.authenticated && window.LezhiAccount?.currentChild?.()?.name==="小星");
  await page.waitForSelector(".kid-classroom");
  if(!await page.locator(".active-child-badge").filter({hasText:"小星"}).isVisible())errors.push("active child badge missing");
  await page.getByRole("button",{name:"家长进展",exact:true}).click();
  await page.getByLabel("家长 PIN",{exact:true}).fill("2468");
  await page.getByLabel("再次输入",{exact:true}).fill("2468");
  await page.getByRole("button",{name:"设置并进入",exact:true}).click();
  await page.getByRole("button",{name:"账户与孩子档案",exact:true}).click();
  await page.getByLabel("新孩子称呼",{exact:true}).fill("小月");
  await Promise.all([page.waitForLoadState("domcontentloaded"),page.getByRole("button",{name:"创建档案",exact:true}).click()]);
  await page.waitForFunction(()=>window.LezhiAccount?.session?.()?.account?.children?.length===2);
  if(!await page.locator(".active-child-badge").filter({hasText:"小星"}).isVisible())errors.push("original child disappeared after creating second profile");
  await page.getByRole("button",{name:"家长进展",exact:true}).click();
  if(await page.getByLabel("家长 PIN",{exact:true}).isVisible().catch(()=>false)){
    await page.getByLabel("家长 PIN",{exact:true}).fill("2468");
    await page.getByRole("button",{name:"验证并进入",exact:true}).click();
  }
  await page.getByRole("button",{name:"账户与孩子档案",exact:true}).click();
  await Promise.all([page.waitForLoadState("domcontentloaded"),page.getByText("小月",{exact:true}).click()]);
  await page.waitForFunction(()=>window.LezhiAccount?.currentChild?.()?.name==="小月");
  if(!await page.locator(".active-child-badge").filter({hasText:"小月"}).isVisible())errors.push("child switch did not persist");
  await page.getByRole("button",{name:"家长进展",exact:true}).click();
  if(await page.getByLabel("家长 PIN",{exact:true}).isVisible().catch(()=>false)){
    await page.getByLabel("家长 PIN",{exact:true}).fill("2468");
    await page.getByRole("button",{name:"验证并进入",exact:true}).click();
  }
  await page.getByRole("button",{name:"账户与孩子档案",exact:true}).click();
  await page.getByRole("button",{name:"退出登录",exact:true}).click();
  await page.getByRole("heading",{name:"欢迎回来",exact:true}).waitFor({state:"visible",timeout:10000});
  if(!await page.getByRole("heading",{name:"欢迎回来",exact:true}).isVisible())errors.push("logout did not return to login");
  return {errors,recoveryCheckpoint:true,childProfiles:2,logout:true};
}

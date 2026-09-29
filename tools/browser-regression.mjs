import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {once} from "node:events";
import {createServer} from "node:net";
import {readFile,mkdir,writeFile,rm} from "node:fs/promises";
import {Script} from "node:vm";

const root=new URL("../",import.meta.url);
const probe=createServer();probe.listen(0,"127.0.0.1");await once(probe,"listening");
const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const base=`http://127.0.0.1:${port}`;
const accountDataDir=new URL(`output/playwright/account-data-${Date.now()}/`,root);
const server=spawn(process.execPath,["server.mjs"],{cwd:root,env:{...process.env,HOST:"127.0.0.1",PORT:String(port),ACCOUNT_DATA_DIR:accountDataDir.pathname},stdio:"ignore"});
let browser;
try {
  let ready=false;
  for(let i=0;i<100;i++) {
    if(server.exitCode!==null)throw new Error("Test server exited before readiness");
    try {const response=await fetch(`http://127.0.0.1:${port}/api/health`);if(response.ok){ready=true;break;}}catch {}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  if(!ready)throw new Error("Test server readiness timeout");
  await mkdir(new URL("output/playwright/",root),{recursive:true});
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext();
  const page=await context.newPage(),pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(e.message));
  await page.goto(base,{waitUntil:"domcontentloaded"});
  const accountAuditSource=await readFile(new URL("teaching-engine/browser-account-audit.js",root),"utf8");
  const accountAudit=await new Script(`(${accountAuditSource})`,{filename:"browser-account-audit"}).runInThisContext()(page);
  await context.close();

  const teachingContext=await browser.newContext();
  const username=`browser_parent_${Date.now()}`;
  const registered=await teachingContext.request.post(`${base}/api/auth/register`,{headers:{origin:base},data:{username,password:"browserpass123",childName:"测试孩子"}});
  if(registered.status()!==201)throw new Error(`Browser test account registration failed: ${registered.status()}`);
  const teachingPage=await teachingContext.newPage();
  teachingPage.on("pageerror",e=>pageErrors.push(e.message));
  // Browser regression must never submit audio or charge a configured provider.
  await teachingPage.route("**/api/**",route=>route.request().method()==="GET" ? route.continue() : route.fulfill({status:503,contentType:"application/json",body:'{"error":"Provider disabled in browser regression"}'}));
  await teachingPage.goto(base,{waitUntil:"domcontentloaded"});
  await teachingPage.waitForFunction(()=>window.LezhiAccount?.ready?.() && window.LezhiAccount?.session?.()?.authenticated && window.LezhiAccount?.currentChild?.());
  const results={pageErrors,"browser-account-audit":accountAudit};
  for(const name of ["browser-v92-audit","browser-v92-interaction-audit","browser-v93-audit","browser-multipart-audit","browser-coaching-audit","browser-v96-acceptance-audit","browser-v97-acceptance-audit","browser-v98-acceptance-audit"]) {
    const source=await readFile(new URL(`teaching-engine/${name}.js`,root),"utf8");
    results[name]=await new Script(`(${source})`,{filename:name}).runInThisContext()(teachingPage);
  }
  await teachingContext.close();
  await writeFile(new URL("output/playwright/v98-results.json",root),JSON.stringify(results,null,2));
  const failures=[...pageErrors,...Object.values(results).flatMap(result=>result && !Array.isArray(result) ? Object.entries(result).filter(([key])=>/errors$/i.test(key)).flatMap(([,items])=>items) : [])];
  if(failures.length)throw new Error(JSON.stringify(failures));
  console.log("PASS browser: previous regressions retained; wrong answers, interrupted teaching, independent practice and usable responsive controls",JSON.stringify(results["browser-v98-acceptance-audit"]));
} finally {
  await browser?.close();
  if(server.exitCode===null){server.kill();await once(server,"exit");}
  await rm(accountDataDir,{recursive:true,force:true});
}

import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {once} from "node:events";
import {createServer} from "node:net";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {Script} from "node:vm";

const root=new URL("../",import.meta.url);
const probe=createServer();probe.listen(0,"127.0.0.1");await once(probe,"listening");
const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const server=spawn(process.execPath,["server.mjs"],{cwd:root,env:{...process.env,HOST:"127.0.0.1",PORT:String(port)},stdio:"ignore"});
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
  // Browser regression must never submit audio or charge a configured provider.
  await page.route("**/api/**",route=>route.request().method()==="GET" ? route.continue() : route.fulfill({status:503,contentType:"application/json",body:'{"error":"Provider disabled in browser regression"}'}));
  await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:"domcontentloaded"});
  const results={pageErrors};
  for(const name of ["browser-v92-audit","browser-v92-interaction-audit"]) {
    const source=await readFile(new URL(`teaching-engine/${name}.js`,root),"utf8");
    results[name]=await new Script(`(${source})`,{filename:name}).runInThisContext()(page);
  }
  await writeFile(new URL("output/playwright/v92-results.json",root),JSON.stringify(results,null,2));
  const failures=[...pageErrors,...Object.values(results).flatMap(result=>result && !Array.isArray(result) ? Object.entries(result).filter(([key])=>/errors$/i.test(key)).flatMap(([,items])=>items) : [])];
  if(failures.length)throw new Error(JSON.stringify(failures));
  console.log("PASS browser: 84 choice clicks, 668 step visuals, 70 responsive states, help toggle, parent filters and accessible teacher");
} finally {
  await browser?.close();
  if(server.exitCode===null){server.kill();await once(server,"exit");}
}

import {readFile,writeFile,readdir} from "node:fs/promises";
import {createHash} from "node:crypto";
const root=new URL("../",import.meta.url);
const digest=async path=>createHash("sha256").update(await readFile(new URL(path,root))).digest("hex");
if(process.argv[2]==="build") {
  const files=["index.html","app.js","server.mjs","styles.css","child-learning-stage.css","package.json","package-lock.json","tools/release.mjs","tools/update-server.sh","assets/lezhi-teacher-v2.png","assets/lezhi-teacher-coach-v3.png",...(await readdir(new URL("teaching-engine/",root))).filter(f=>f.endsWith(".js")).map(f=>`teaching-engine/${f}`)];
  const hashes={};for(const path of files.sort())hashes[path]=await digest(path);
  await writeFile(new URL("release.json",root),JSON.stringify({id:"v91-20260830",builtAt:new Date().toISOString(),hashes},null,2)+"\n");
  console.log(`Built release manifest: ${files.length} files`);
} else {
  const manifest=JSON.parse(await readFile(new URL("release.json",root),"utf8"));
  for(const [path,hash] of Object.entries(manifest.hashes)) {
    if(path.includes("..") || path.startsWith("/") || await digest(path)!==hash)throw new Error(`Release mismatch: ${path}`);
  }
  console.log(`Verified ${manifest.id}: ${Object.keys(manifest.hashes).length} files`);
}

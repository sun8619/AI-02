import {readFile,writeFile,readdir} from "node:fs/promises";
import {createHash} from "node:crypto";
const root=new URL("../",import.meta.url);
const digest=async path=>createHash("sha256").update(await readFile(new URL(path,root))).digest("hex");
const walk=async directory=>{
  const entries=await readdir(new URL(directory,root),{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const path=`${directory}${entry.name}`;
    if(entry.isDirectory())files.push(...await walk(`${path}/`));
    else if(entry.isFile())files.push(path);
  }
  return files;
};
if(process.argv[2]==="build") {
  const topLevel=["index.html","boot.js","app.js","server.mjs","styles.css","child-learning-stage.css","robots.txt","manifest.webmanifest","package.json","package-lock.json"];
  const discovered=[...await walk("assets/"),...await walk("teaching-engine/"),...await walk("tools/")]
    .filter(path=>/\.(?:js|mjs|sh|png|jpg|jpeg|webp|avif|svg|md|csv)$/.test(path));
  const files=[...new Set([...topLevel,...discovered])].sort();
  const hashes={};for(const path of files)hashes[path]=await digest(path);
  const now=new Date();
  const stamp=now.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  const id=`release-${stamp}`;
  await writeFile(new URL("release.json",root),JSON.stringify({id,builtAt:now.toISOString(),hashes},null,2)+"\n");
  console.log(id);
} else {
  const manifest=JSON.parse(await readFile(new URL("release.json",root),"utf8"));
  for(const [path,hash] of Object.entries(manifest.hashes)) {
    if(path.includes("..") || path.startsWith("/") || await digest(path)!==hash)throw new Error(`Release mismatch: ${path}`);
  }
  console.log(`Verified ${manifest.id}: ${Object.keys(manifest.hashes).length} files`);
}

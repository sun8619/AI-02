import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

// Run the real updater with temporary paths and fake network/service commands.
// Real /opt directories, credentials, downloads and systemd are never touched.
const source = readFileSync(new URL("./update-server.sh", import.meta.url), "utf8");
const sandbox = mkdtempSync(join(tmpdir(), "lezhi-deploy-test-"));
const sha = "a".repeat(40);
try {
  for (const scenario of ["success", "download-failure", "preflight-failure", "restart-failure", "stale-health"]) {
    const dir = join(sandbox, scenario), app = join(dir, "app"), bin = join(dir, "bin");
    const packageDir = join(dir, `AI-02-${sha}`), archive = join(dir, "release.zip");
    for (const path of [app, bin, join(packageDir,"tools"), join(app,"data"), join(app,".git")]) mkdirSync(path, { recursive:true });
    writeFileSync(join(app,"app.js"), 'const version="old";\n');
    writeFileSync(join(app,".env"), "TEST_ONLY=preserve\n");
    writeFileSync(join(app,"data","progress.json"), "preserve progress\n");
    writeFileSync(join(app,".git","test-sentinel"), "preserve git\n");
    const newCode = 'const version="new";\n';
    writeFileSync(join(packageDir,"app.js"), newCode);
    for(const path of [join(app,"app.js"),join(packageDir,"app.js")]) utimesSync(path,1600000000,1600000000);
    writeFileSync(join(packageDir,"server.mjs"), "export {};\n");
    writeFileSync(join(packageDir,"package.json"), '{"private":true}\n');
    writeFileSync(join(packageDir,"release.json"), JSON.stringify({id:"v91-test",hashes:{"app.js":createHash("sha256").update(newCode).digest("hex")}}));
    writeFileSync(join(packageDir,"tools","release.mjs"), readFileSync(new URL("./release.mjs", import.meta.url)));
    const zip = spawnSync("zip", ["-qr", archive, `AI-02-${sha}`], {cwd:dir});
    assert.equal(zip.status,0,"zip fixture failed");
    const curl = [
      '#!/usr/bin/env bash',
      'for arg in "$@"; do',
      '  if [[ "$arg" == *127.0.0.1* ]]; then',
      '    if [ "$SCENARIO" = stale-health ]; then echo \'{"ok":true,"release":"old"}\'; else echo \'{"ok":true,"release":"v91-test"}\'; fi',
      '    exit 0',
      '  fi',
      'done',
      '[ "$SCENARIO" != download-failure ] || exit 22',
      'while [ "$#" -gt 0 ]; do',
      '  if [ "$1" = -o ]; then cp "$ARCHIVE" "$2"; exit 0; fi',
      '  shift',
      'done',
      'exit 2',
    ].join("\n");
    writeFileSync(join(bin,"curl"), curl, {mode:0o755});
    writeFileSync(join(bin,"npm"), '#!/usr/bin/env bash\n[ "$SCENARIO" != preflight-failure ]\n', {mode:0o755});
    writeFileSync(join(bin,"systemctl"), '#!/usr/bin/env bash\n[ "$SCENARIO" != restart-failure ]\n', {mode:0o755});
    const script = source
      .replace("APP=/opt/qibu-ai", `APP="${app}"`)
      .replace('BACKUP="/root/qibu-backups/$(date +%Y%m%d-%H%M%S)-$$"', `BACKUP="${join(dir,"backup")}"`)
      .replace("{1..30}", "{1..2}")
      .replace("sleep 1", "sleep 0.01");
    const result = spawnSync("bash", ["-s", "--", sha], {
      input:script, encoding:"utf8", timeout:60000,
      env:{...process.env,PATH:`${bin}:${process.env.PATH}`,ARCHIVE:archive,SCENARIO:scenario},
    });
    assert.equal(result.error,undefined,`${scenario}: updater harness timed out or failed to launch`);
    if(scenario==="success") assert.equal(result.status,0,result.stderr || result.stdout);
    else assert.ok(result.status!==0,scenario+": failure was ignored");
    assert.equal(readFileSync(join(app,"app.js"),"utf8"),scenario==="success" ? newCode : 'const version="old";\n',scenario);
    assert.equal(readFileSync(join(app,".env"),"utf8"),"TEST_ONLY=preserve\n");
    assert.equal(readFileSync(join(app,"data","progress.json"),"utf8"),"preserve progress\n");
    assert.equal(readFileSync(join(app,".git","test-sentinel"),"utf8"),"preserve git\n");
    console.log(`PASS deploy ${scenario}: application and protected files verified`);
  }
} finally {
  rmSync(sandbox, {recursive:true,force:true});
}

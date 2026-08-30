import assert from "node:assert/strict";
import { loadChildRuntime } from "./runtime-test-harness.js";

const pending = [], played = [], timers = new Map();
let timerId = 0;
class TestAudio {
  constructor(url) { this.url = url; this.paused = false; }
  async play() { played.push(this); this.onplay?.(); }
  pause() { this.paused = true; }
  removeAttribute() { this.released = true; }
  load() { this.unloaded = true; }
}
const r = loadChildRuntime({audio:true,overrides:{
  Audio: TestAudio,
  setTimeout(fn,ms) { timers.set(++timerId,{fn,ms}); return timerId; },
  clearTimeout(id) { timers.delete(id); },
  fetch(url, options) { return new Promise((resolve,reject)=>pending.push({url,options,resolve,reject})); },
}});
r.evaluate('globalThis.problems=[]; notifyTtsProblem=(p)=>problems.push(p.kind);');
const resolve = request => request.resolve({ok:true,status:200,json:async()=>({audioBase64:"test",format:"mp3"})});
const old = r.evaluate('state.aiMessage="旧的一句"; speakCurrentMessage()');
const latest = r.evaluate('state.aiMessage="新的一句"; speakCurrentMessage()');
assert.equal(pending[0].options.signal.aborted,true);
resolve(pending[0]); await old;
assert.equal(played.length,0,"cancelled synthesis must never start playback");
resolve(pending[1]); await latest;
assert.equal(played.length,1);
r.evaluate('cancelSupersededInteraction()');
assert.equal(played[0].paused,true,"new child input stops active audio");
assert.equal(r.evaluate('problems.length'),0,"normal cancellation is not an error");

const timeout = r.evaluate('speakCurrentMessage()');
const timed = pending.at(-1);
for (const timer of timers.values()) if(timer.ms===20000) timer.fn();
timed.reject(Object.assign(new Error("aborted"),{name:"AbortError"}));
await timeout;
assert.equal(r.evaluate('problems.at(-1)'),"timeout");

const limited = r.evaluate('speakCurrentMessage()');
pending.at(-1).resolve({ok:false,status:429,json:async()=>({})});
await limited;
assert.equal(r.evaluate('problems.at(-1)'),"rate-limit");

r.context.Audio = class extends TestAudio { async play() { throw Object.assign(new Error(),{name:"NotAllowedError"}); } };
const blocked = r.evaluate('speakCurrentMessage()'); resolve(pending.at(-1)); await blocked;
assert.equal(r.evaluate('problems.at(-1)'),"autoplay");
r.context.Audio = TestAudio;
const retry = r.evaluate('speakCurrentMessage()'); resolve(pending.at(-1)); await retry;
assert.equal(played.length,2,"replay can recover after autoplay denial");

r.evaluate('scheduleLatestHelpAction("hint"); scheduleLatestHelpAction("hint"); scheduleLatestHelpAction("visual");');
assert.equal([...timers.values()].filter(t=>t.ms===220).length,1,"only final help click survives debounce");
r.evaluate('cancelSupersededInteraction()');
for(let i=0;i<10;i++) {
  const turn=r.evaluate('state.aiMessage="这一轮的讲解"; speakCurrentMessage()');resolve(pending.at(-1));await turn;
  const audio=played.at(-1);audio.onended();
  assert.equal(audio.released,true,"completed audio releases its source");
  assert.equal(audio.unloaded,true,"completed audio unloads playback resources");
}
const hidden=r.evaluate('state.aiMessage="保留文字内容"; speakCurrentMessage()');
r.evaluate('suspendVoiceInteraction()');
assert.equal(pending.at(-1).options.signal.aborted,true,"backgrounding aborts pending synthesis");
resolve(pending.at(-1));await hidden;
assert.equal(r.evaluate('state.aiMessage'),"保留文字内容");
console.log("PASS voice lifecycle: stale synthesis, active audio, cancellation, timeout, rate limit, autoplay recovery, latest help, ten-turn cleanup and background suspension");

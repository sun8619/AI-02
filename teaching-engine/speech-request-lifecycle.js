// Stop synthesis upstream when its browser response is no longer wanted.
export async function readSpeechResponse(url, options, response, {timeoutMs=15000, fetcher=fetch}={}) {
  const controller=new AbortController();
  let timedOut=false;
  const onClose=()=>controller.abort();
  response.once("close",onClose);
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
  try {
    if(response.destroyed) controller.abort();
    const upstream=await fetcher(url,{...options,signal:controller.signal});
    const raw=await upstream.text();
    return {upstream,raw};
  } catch(error) {
    if(timedOut) throw Object.assign(new Error("Speech synthesis timed out"),{code:"SPEECH_TIMEOUT"});
    throw error;
  } finally {
    clearTimeout(timer);
    response.off("close",onClose);
  }
}

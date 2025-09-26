// let mediaStream, mediaRecorder, audioChunks = [];
// let sessionId = crypto.randomUUID();

// const talkBtn = document.getElementById('talkBtn');
// const player  = document.getElementById('player');
// const logBox  = document.getElementById('log');

// talkBtn.addEventListener('mousedown', startRec);
// talkBtn.addEventListener('touchstart', startRec);

// talkBtn.addEventListener('mouseup', stopRec);
// talkBtn.addEventListener('mouseleave', stopRec);
// talkBtn.addEventListener('touchend', stopRec);

// async function startRec() {
//   if (!mediaStream) {
//     mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
//   }
//   audioChunks = [];
//   mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
//   mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
//   mediaRecorder.start(10);
//   talkBtn.textContent = 'Recording... release to send';
// }

// async function stopRec() {
//   if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
//   await new Promise(res => {
//     mediaRecorder.onstop = res;
//     mediaRecorder.stop();
//   });
//   talkBtn.textContent = 'Uploading...';

//   const webmBlob = new Blob(audioChunks, { type: 'audio/webm' });
//   const arrayBuf = await webmBlob.arrayBuffer();
//   const ctx = new AudioContext({ sampleRate: 16000 }); // target 16k
//   const audioBuf = await ctx.decodeAudioData(arrayBuf);
//   const wavBlob = encodeWav(audioBuf, 16000);

//   const form = new FormData();
//   form.append('file', wavBlob, 'speech.wav');
//   form.append('session_id', sessionId);

//   const res = await fetch('/api/utterance', { method: 'POST', body: form });
//   const data = await res.json();

//   if (data.agent_audio_url) {
//     player.src = data.agent_audio_url;
//     await player.play().catch(()=>{});
//   }

//   logBox.textContent =
//     `Stage: ${data.stage}\n` +
//     `Intent: ${data.intent || ''}\n` +
//     `You: ${data.user_text || ''}\n` +
//     `Agent: ${data.agent_text || ''}`;

//   talkBtn.textContent = 'Hold to Talk';
// }

// /* ------- WAV encoder (mono) ------- */
// function encodeWav(audioBuffer, targetRate) {
//   const src = audioBuffer.getChannelData(0);
//   const rate = audioBuffer.sampleRate;
//   const ratio = rate / targetRate;
//   const length = Math.round(src.length / ratio);
//   const mono = new Float32Array(length);
//   for (let i = 0; i < length; i++) {
//     mono[i] = src[Math.min(src.length - 1, Math.round(i * ratio))] || 0;
//   }
//   const bytesPerSample = 2;
//   const buffer = new ArrayBuffer(44 + mono.length * bytesPerSample);
//   const view = new DataView(buffer);

//   function writeString(off, s) { for (let i=0;i<s.length;i++) view.setUint8(off+i, s.charCodeAt(i)); }
//   let offset = 0;
//   writeString(offset, 'RIFF'); offset += 4;
//   view.setUint32(offset, 36 + mono.length * bytesPerSample, true); offset += 4;
//   writeString(offset, 'WAVE'); offset += 4;
//   writeString(offset, 'fmt '); offset += 4;
//   view.setUint32(offset, 16, true); offset += 4;
//   view.setUint16(offset, 1, true); offset += 2;
//   view.setUint16(offset, 1, true); offset += 2;
//   view.setUint32(offset, targetRate, true); offset += 4;
//   view.setUint32(offset, targetRate * 2, true); offset += 4;
//   view.setUint16(offset, 2, true); offset += 2;
//   view.setUint16(offset, 16, true); offset += 2;
//   writeString(offset, 'data'); offset += 4;
//   view.setUint32(offset, mono.length * bytesPerSample, true); offset += 4;
//   let idx = 44;
//   for (let i = 0; i < mono.length; i++, idx += 2) {
//     const s = Math.max(-1, Math.min(1, mono[i]));
//     view.setInt16(idx, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
//   }
//   return new Blob([view], { type: 'audio/wav' });
// }


let mediaStream, mediaRecorder, audioChunks = [];
let sessionId = crypto.randomUUID();

const talkBtn = document.getElementById('talkBtn');
const player  = document.getElementById('player');
const chat    = document.getElementById('chat');

talkBtn.addEventListener('mousedown', startRec);
talkBtn.addEventListener('touchstart', startRec);

talkBtn.addEventListener('mouseup', stopRec);
talkBtn.addEventListener('mouseleave', stopRec);
talkBtn.addEventListener('touchend', stopRec);

function appendMsgs(history) {
  chat.innerHTML = ''; // re-render full list from server to stay in sync
  for (const m of history) {
    const row = document.createElement('div');
    row.className = `msg ${m.role}`;
    const bub = document.createElement('div');
    bub.className = 'bubble';
    bub.textContent = m.text || '';
    row.appendChild(bub);
    chat.appendChild(row);
  }
  chat.scrollTop = chat.scrollHeight;
}

async function startRec() {
  if (!mediaStream) {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  }
  audioChunks = [];
  mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start(10);
  talkBtn.textContent = 'Recording... release to send';
}

async function stopRec() {
  if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
  await new Promise(res => { mediaRecorder.onstop = res; mediaRecorder.stop(); });
  talkBtn.textContent = 'Uploading...';

  // Encode WebM -> WAV (mono 16k) in-browser
  const webmBlob = new Blob(audioChunks, { type: 'audio/webm' });
  const arrayBuf = await webmBlob.arrayBuffer();
  const ctx = new AudioContext({ sampleRate: 16000 });
  const audioBuf = await ctx.decodeAudioData(arrayBuf);
  const wavBlob = encodeWav(audioBuf, 16000);

  const form = new FormData();
  form.append('file', wavBlob, 'speech.wav');
  form.append('session_id', sessionId);

  const res = await fetch('/api/utterance', { method: 'POST', body: form });
  const data = await res.json();

  // Play agent audio if present
  if (data.agent_audio_url) {
    player.src = data.agent_audio_url;
    await player.play().catch(()=>{});
  }

  // Render server-side conversation history
  if (Array.isArray(data.history)) {
    appendMsgs(data.history);
  }

  talkBtn.textContent = 'Hold to Talk';
}

/* ------- WAV encoder (mono) ------- */
function encodeWav(audioBuffer, targetRate) {
  const src = audioBuffer.getChannelData(0);
  const rate = audioBuffer.sampleRate;
  const ratio = rate / targetRate;
  const length = Math.round(src.length / ratio);
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) mono[i] = src[Math.min(src.length - 1, Math.round(i * ratio))] || 0;

  const bytesPerSample = 2, blockAlign = bytesPerSample;
  const buffer = new ArrayBuffer(44 + mono.length * bytesPerSample);
  const view = new DataView(buffer);
  let o = 0;
  writeStr('RIFF'); u32(36 + mono.length * bytesPerSample); writeStr('WAVE');
  writeStr('fmt '); u32(16); u16(1); u16(1); u32(targetRate); u32(targetRate * blockAlign); u16(blockAlign); u16(16);
  writeStr('data'); u32(mono.length * bytesPerSample);
  for (let i = 0; i < mono.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return new Blob([view], { type: 'audio/wav' });

  function writeStr(s){ for (let i=0;i<s.length;i++) view.setUint8(o++, s.charCodeAt(i)); }
  function u16(v){ view.setUint16(o, v, true); o += 2; }
  function u32(v){ view.setUint32(o, v, true); o += 4; }
}

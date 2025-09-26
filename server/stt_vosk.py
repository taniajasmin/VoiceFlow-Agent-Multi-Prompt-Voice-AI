import os, json, wave
# import numpy as np
from vosk import Model, KaldiRecognizer

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "vosk-model-small-en-us-0.15")

_model = Model(MODEL_DIR)

def transcribe_wav(path: str) -> str:
    wf = wave.open(path, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() not in (16000, 8000, 44100, 48000):
        raise ValueError("Please send mono 16-bit WAV. Sample rates: 16k/44.1k/48k ok.")
    rec = KaldiRecognizer(_model, wf.getframerate())
    text_parts = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            text_parts.append(res.get("text", ""))
    final = json.loads(rec.FinalResult()).get("text", "")
    wf.close()
    return " ".join([*text_parts, final]).strip()
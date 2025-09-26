import os
import pyttsx3
import tempfile

_engine = pyttsx3.init()
# optional: tweak voice/rate if available on your system
_engine.setProperty("rate", 175)

def synth_to_wav(text: str, out_dir: str) -> str:
    os.makedirs(out_dir, exist_ok=True)
    fd, path = tempfile.mkstemp(prefix="tts_", suffix=".wav", dir=out_dir)
    os.close(fd)
    _engine.save_to_file(text, path)
    _engine.runAndWait()
    return path
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load env so we pick up OPENAI_API_KEY
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def transcribe_wav(path: str) -> str:
    """Transcribe WAV file using OpenAI Whisper."""
    with open(path, "rb") as f:
        # whisper-1 is the classic Whisper model
        resp = client.audio.transcriptions.create(model="whisper-1", file=f)
    return (resp.text or "").strip()

import os
from .prompts import GREETING_PROMPT, INTENT_PROMPT, RESPONSE_PROMPT
from .state import STATE
from .tts_pyttsx3 import synth_to_wav
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()  

from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

client = OpenAI()  

AUDIO_OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "static", "out"))

class GreetingNode:
    def run(self, session_id: str) -> dict:
        # Generate a fixed greeting once (no OpenAI call needed if you want it hardcoded)
        text = "Hello, thanks for calling. How can I help you today?"
        audio_path = synth_to_wav(text, AUDIO_OUT_DIR)
        STATE.set(session_id, "greeted", True)
        return {"node": "greeting", "text": text, "audio_path": audio_path}

class IntentNode:
    def run(self, user_text: str) -> str:
        prompt = INTENT_PROMPT.format(user_text=user_text)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=3,
        )
        intent = resp.choices[0].message.content.strip().lower()
        if intent not in ("billing", "support", "general"):
            intent = "general"
        return intent

class ResponseNode:
    def run(self, intent: str, user_text: str) -> dict:
        prompt = RESPONSE_PROMPT.format(intent=intent, user_text=user_text)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=120,
        )
        text = resp.choices[0].message.content.strip()
        audio_path = synth_to_wav(text, AUDIO_OUT_DIR)
        return {"node": "response", "intent": intent, "text": text, "audio_path": audio_path}

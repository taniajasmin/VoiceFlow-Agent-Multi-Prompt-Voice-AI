import os, uuid, shutil
from fastapi import FastAPI, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from dotenv import load_dotenv

from .state import STATE
# from .stt_vosk import transcribe_wav
from .stt_whisper import transcribe_wav
from .nodes import GreetingNode, IntentNode, ResponseNode

load_dotenv()

app = FastAPI(title="Mini PipeCat Voice Agent")

BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
OUT_DIR = os.path.join(STATIC_DIR, "out")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

greet_node = GreetingNode()
intent_node = IntentNode()
resp_node = ResponseNode()

@app.get("/")
def index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# @app.post("/api/utterance")
# async def handle_utterance(file: UploadFile, session_id: str = Form(...)):
#     # Save uploaded WAV
#     sid = session_id or str(uuid.uuid4())
#     in_path = os.path.join(UPLOAD_DIR, f"{sid}_{uuid.uuid4().hex}.wav")
#     with open(in_path, "wb") as f:
#         shutil.copyfileobj(file.file, f)

#     # If not greeted, greet first and return
#     st = STATE.get(sid)
#     if not st.get("greeted", False):
#         out = greet_node.run(sid)
#         audio_url = f"/static/out/{os.path.basename(out['audio_path'])}"
#         return JSONResponse({
#             "session_id": sid,
#             "stage": "greeting",
#             "agent_text": out["text"],
#             "agent_audio_url": audio_url,
#             "user_text": "",
#             "intent": None
#         })

#     # Otherwise: STT -> Intent -> Response
#     user_text = transcribe_wav(in_path)
#     intent = intent_node.run(user_text)
#     out = resp_node.run(intent, user_text)
#     audio_url = f"/static/out/{os.path.basename(out['audio_path'])}"

#     return JSONResponse({
#         "session_id": sid,
#         "stage": "response",
#         "user_text": user_text,
#         "intent": intent,
#         "agent_text": out["text"],
#         "agent_audio_url": audio_url
#     })

# server/main.py  (only the /api/utterance endpoint shown)
@app.post("/api/utterance")
async def handle_utterance(file: UploadFile, session_id: str = Form(...)):
    # Save uploaded WAV
    sid = session_id or str(uuid.uuid4())
    in_path = os.path.join(UPLOAD_DIR, f"{sid}_{uuid.uuid4().hex}.wav")
    with open(in_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    st = STATE.get(sid)
    st.setdefault("greeted", False)
    st.setdefault("history", [])
    history = st["history"]

    # If not greeted, greet first
    if not st.get("greeted", False):
        out = greet_node.run(sid)
        # save assistant message
        history.append({"role": "assistant", "text": out["text"]})
        audio_url = f"/static/out/{os.path.basename(out['audio_path'])}"
        return JSONResponse({
            "session_id": sid,
            "agent_audio_url": audio_url,
            "history": history,  # full history back to client
        })

    # Otherwise: STT -> Intent -> Response
    user_text = transcribe_wav(in_path) or ""
    if user_text.strip():
        history.append({"role": "user", "text": user_text})

    intent = intent_node.run(user_text)
    out = resp_node.run(intent, user_text)
    # save assistant message
    history.append({"role": "assistant", "text": out["text"]})
    audio_url = f"/static/out/{os.path.basename(out['audio_path'])}"

    return JSONResponse({
        "session_id": sid,
        "agent_audio_url": audio_url,
        "history": history,
    })
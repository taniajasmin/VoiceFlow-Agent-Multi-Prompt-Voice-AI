# VoiceFlow Agent – Multi-Prompt Voice AI Demo

![VoiceFlow Agent Screenshot](https://github.com/user-attachments/assets/8244bfa7-1d4c-4cd2-8b2e-a9ccd2e809d5)

A lightweight **voice AI agent demo** built with **FastAPI, OpenAI GPT + Whisper, and local TTS**. This project demonstrates a **three-node conversational flow** (Greeting → Intent Classification → Response Generation) with a chat-style web interface. Perfect for client demos showcasing real-time voice input, AI-driven intent recognition, and spoken responses.

---

## Features

- **Three-Node Conversational Flow**:
  - **Greeting Node**: Welcomes the user with a friendly message.
  - **Intent Node**: Classifies user intent (e.g., card activation, lost card, billing, general).
  - **Response Node**: Generates concise, context-aware responses delivered via TTS.

- **High-Accuracy Speech Recognition**:
  - Powered by **OpenAI Whisper API** for real-time transcription.
  - Optional **offline Vosk STT** for local, API-free usage.

- **Text-to-Speech**:
  - Default: **pyttsx3** for offline, cost-free TTS.
  - Optional: **Piper TTS** for natural, neural-based voices.

- **Chat-Style Web Interface**:
  - Live microphone input with a "hold-to-talk" button.
  - Conversation history displayed as chat bubbles.
  - Automatic playback of agent’s spoken responses.

- **Lightweight & Open-Source Friendly**:
  - Built with Python 3.11+, FastAPI, and vanilla JS/HTML/CSS.
  - Runs locally without Docker.

---

## Project Structure

```
voiceflow-agent/
├── server/
│   ├── main.py            # FastAPI backend
│   ├── nodes.py          # Greeting, Intent, Response nodes
│   ├── stt_whisper.py    # Whisper STT (default)
│   ├── tts_pyttsx3.py    # Local TTS
│   ├── prompts.py        # Custom prompts and intents
│   ├── state.py          # Session and memory management
│   └── static/           # Frontend (index.html, app.js, CSS)
├── models/               # (Optional) Vosk model for offline STT
├── .env                  # OPENAI_API_KEY=...
├── requirements.txt      # Project dependencies
└── README.md             # This file
```

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/voiceflow-agent.git
cd voiceflow-agent
```

### 2. Set Up a Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```
> **Tip**: Remove `vosk` from `requirements.txt` if you don’t need offline STT.

### 4. Configure OpenAI API Key
Create a `.env` file in the project root:
```
OPENAI_API_KEY=sk-your-key-here
```

### 5. (Optional) Offline Vosk Model
Download `vosk-model-en-us-0.22` or `vosk-model-small-en-us-0.15` from [Vosk Models](https://alphacephei.com/vosk/models) and place it in the `models/` directory.

### 6. Run the Server
```bash
uvicorn server.main:app --reload
```
Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## How It Works

1. **Initial Interaction**: Press the "hold-to-talk" button to trigger the **Greeting Node**.
2. **Conversation Flow**: Speak into the microphone. Your input is transcribed (Whisper STT), classified (Intent Node via GPT), and answered with a spoken response (Response Node via TTS).
3. **Chat Interface**: View the conversation history as chat bubbles, with automatic playback of the agent’s responses.

---

## Customizing the Agent

- **Prompts & Intents**: Modify `server/prompts.py` to adjust classification labels or response styles.
- **Persona**: Adapt prompts to create specialized agents (e.g., psychologist, concierge, or dream interpreter).
- **TTS Engine**: Replace `pyttsx3` with **Piper TTS** for more natural voices.

---

## Example Intents (Credit Card Demo)

| User Input (via Mic)         | Classified Intent   | Example Agent Reply                                                                 |
|------------------------------|--------------------|-------------------------------------------------------------------------------------|
| “I lost my credit card”      | `lost_card`        | “I’m sorry to hear that. I can freeze your card now and help you order a replacement.” |
| “I need to activate my card” | `card_activation`  | “Let’s get your new card activated. Please enter the code you received via SMS.”     |
| “I have a billing question”  | `billing`          | “Your statement date is the 10th. The minimum due is $45. Want a summary?”           |
| “Hi”                         | `general`          | “Hello! How can I assist you today?”                                                |

---

## Tech Stack

- **Backend**: FastAPI, Python 3.11+
- **Speech Recognition**: OpenAI Whisper API (default) or Vosk (offline)
- **Language Model**: OpenAI GPT-4o-mini for intent classification and responses
- **Text-to-Speech**: pyttsx3 (offline), optional Piper TTS
- **Frontend**: Vanilla JS, HTML5, CSS

---

## Why This Project?

This demo was built to showcase:
- Real-time **voice AI** with multi-prompt conversational flows.
- Seamless integration of **microphone input**, **AI understanding**, and **spoken responses**.
- A minimal, client-ready **chat interface** with conversation memory.

---


## Roadmap

- **Pipecat Integration**: Support for WebRTC or SIP telephony.
- **WebSocket Streaming**: Enable live, no-push-to-talk conversations.
- **Enhanced TTS**: Integrate Piper or ElevenLabs for natural voices.
- **Vector Memory**: Store user context across sessions for continuity.


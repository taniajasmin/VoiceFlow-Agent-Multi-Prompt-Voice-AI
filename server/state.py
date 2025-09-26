from collections import defaultdict

class SessionState:
    def __init__(self):
        # session_id -> dict
        self._store = defaultdict(lambda: {"greeted": False})

    def get(self, sid: str) -> dict:
        return self._store[sid]

    def set(self, sid: str, key: str, value):
        self._store[sid][key] = value

STATE = SessionState()

from app.exceptions.base import NotFoundError


class ChatError(Exception):
    """Marker mixin — tag for anything ticket-domain, not a response type itself."""


class SessionNotFoundError(ChatError, NotFoundError):
    def __init__(self, session_id):
        self.session_id = session_id
        super().__init__(f"Session {session_id} not found")

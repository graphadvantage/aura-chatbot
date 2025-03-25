from pydantic import BaseModel

class Question(BaseModel):
        question: str
        session_id: str = None
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


class API:

    _instance = None

    def __init__(self, allowed_origins):

        self._app = FastAPI()

        self._app.add_middleware(
            CORSMiddleware,
            allow_origins=allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @classmethod
    def get_instance(cls, allowed_origins=None):
        if cls._instance is None:
            cls._instance = cls(allowed_origins)
        return cls._instance

    @property
    def app(self):   
        return self._app
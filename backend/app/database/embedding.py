from neo4j_graphrag.embeddings import OpenAIEmbeddings

class Embedding:

    _instance = None

    def __init__(self, model, api_key):
        self._embedder = OpenAIEmbeddings(model=model, api_key=api_key)

    @classmethod
    def get_instance(cls, model="text-embedding-ada-002", api_key=None):
        if cls._instance is None:
            cls._instance = cls(model, api_key)
        return cls._instance
    
    @property
    def embedder(self):
        return self._embedder
      
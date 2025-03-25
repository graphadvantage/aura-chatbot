from neo4j_graphrag.generation import GraphRAG

class Agent:

    _instance = None

    def __init__(self, retriever, llm):
        self._retriever = retriever
        self._llm = llm
        self._rag = GraphRAG(retriever=self._retriever, llm=self._llm)

    @classmethod
    def get_instance(cls, retriever, llm):
        if cls._instance is None:
            cls._instance = cls(retriever, llm)
        return cls._instance
    
    @property
    def rag(self):
        return self._rag
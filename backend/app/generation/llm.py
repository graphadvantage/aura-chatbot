from neo4j_graphrag.llm import OpenAILLM

class LLM:

    _instance = None

    def __init__(self, model_name, model_params, api_key):
        self._llm = OpenAILLM(model_name=model_name, model_params=model_params, api_key=api_key)

    @classmethod
    def get_instance(cls, model_params=None, model_name="o3-mini", api_key=None):
        if model_params is None:
            model_params = {}
        if cls._instance is None:
            cls._instance = cls(model_name, model_params, api_key)
        return cls._instance
    
    @property
    def llm(self):
        return self._llm

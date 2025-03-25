import neo4j
from neo4j_graphrag.retrievers import VectorCypherRetriever
from neo4j_graphrag.types import RetrieverResultItem

class Retriever:
    
    _instance = None

    RETRIEVAL_QUERY = (
        """
        with node, score OPTIONAL MATCH (node)-[]-(e:!Chunk&!Document) 
        return collect(elementId(node))+collect(elementId(e)) as listIds, 
        collect(e.id) as contextNodes, node.text as nodeText, score
        """
    )

    def __init__(self, driver, embedder, index_name):
        self._retriever = VectorCypherRetriever(
            driver,
            index_name=index_name,
            retrieval_query=self.RETRIEVAL_QUERY,
            result_formatter=self.formatter,
            embedder=embedder,
            neo4j_database='neo4j',
        )

    @staticmethod
    def formatter(record: neo4j.Record) -> RetrieverResultItem:
        node_text = record.get("nodeText")
        score = record.get("score")
        list_ids = record.get("listIds")
        context_nodes = record.get("contextNodes")

        return RetrieverResultItem(
            content=f"{node_text}: score {score}, Related context: {context_nodes}", 
            metadata={
                "listIds": list_ids,
                "nodeText": node_text
            }
        )
    
    @classmethod
    def get_instance(cls, driver, embedder, index_name=None):
        if cls._instance is None:
            cls._instance = cls(driver, embedder, index_name)
        return cls._instance
    
    @property
    def retriever(self):
        return self._retriever



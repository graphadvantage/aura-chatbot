import neo4j
#from neo4j_graphrag.retrievers import VectorCypherRetriever
from neo4j_graphrag.retrievers import HybridCypherRetriever
from neo4j_graphrag.types import RetrieverResultItem

class Retriever:

    _instance = None

#this query pulls the UnstructredElements parsed from the chunk
    RETRIEVAL_QUERY_OLD= (
        """
        with node, score OPTIONAL MATCH (node)-[]-(e:!Chunk&!Document)
        return collect(elementId(node))+collect(elementId(e)) as listIds,
        collect(e.id) as contextNodes, node.text as nodeText, score
        """
    )

#this query pulls the adjacent Chunks, Entities
    RETRIEVAL_QUERY = (
            """
            with node, score OPTIONAL MATCH (node)-[:NEXT_CHUNK|HAS_ENTITY]-(e:!Image&!Table)
            return collect(elementId(node))+collect(elementId(e)) as listIds,
            collect(e.id) as contextNodes, node.text as nodeText, score ORDER BY score DESC LIMIT 100
            """
        )

    def __init__(self, driver, embedder, vector_index_name, fulltext_index_name):
        self._retriever = HybridCypherRetriever(
            driver,
            vector_index_name=vector_index_name,
            fulltext_index_name=fulltext_index_name,
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
    def get_instance(cls, driver, embedder, vector_index_name=None,fulltext_index_name=None):
        if cls._instance is None:
            cls._instance = cls(driver, embedder, vector_index_name,fulltext_index_name)
        return cls._instance

    @property
    def retriever(self):
        return self._retriever

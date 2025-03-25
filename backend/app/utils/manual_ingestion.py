from app.database.embedding import Embedding
from app.database.driver import Neo4jDriver
from app.config import NEO4J_URI,NEO4J_USERNAME, NEO4J_PASSWORD, OPENAI_API_KEY

embedder_instance = Embedding.get_instance(
    api_key=OPENAI_API_KEY
)

embedder = embedder_instance.embedder


driver_instance = Neo4jDriver.get_instance(
    uri=NEO4J_URI,
    username=NEO4J_USERNAME,
    password=NEO4J_PASSWORD
)

driver = driver_instance.driver


with driver.session() as session:
    res = session.run(
        """
        MATCH (e:Chunk)
        WHERE e.text IS NOT NULL AND e.morganEmbedding IS NULL
        RETURN e.id as id, e.text as data
        """
    )
    for record in res:
        chunk_id = record["id"]
        data = record["data"]
        if len(data) > 12000:
            print(f"Skipping chunks {chunk_id} with data length {len(data)}")
            continue
        print(f"Embedding chunk {chunk_id}")
        embedding = embedder.embed_query(data)
        session.run(
            """
            MATCH (e:Chunk {id: $chunk_id})
            SET e.morganEmbedding = $embedding
            """,
            chunk_id=chunk_id,
            embedding=embedding
        )
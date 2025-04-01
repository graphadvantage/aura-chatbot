import os

from unstructured_ingest.v2.pipeline.pipeline import Pipeline
from unstructured_ingest.v2.interfaces import ProcessorConfig

from unstructured_ingest.v2.processes.connectors.neo4j import (
    Neo4jAccessConfig,
    Neo4jConnectionConfig,
    Neo4jUploadStagerConfig,
    Neo4jUploaderConfig
)
from unstructured_ingest.v2.processes.connectors.local import (
    LocalIndexerConfig,
    LocalConnectionConfig,
    LocalDownloaderConfig
)
from unstructured_ingest.v2.processes.partitioner import PartitionerConfig
from unstructured_ingest.v2.processes.chunker import ChunkerConfig
from unstructured_ingest.v2.processes.embedder import EmbedderConfig

#LOCAL_FILE_INPUT_DIR = "/Users/michaelmoore/Projects/att/test"
LOCAL_FILE_INPUT_DIR = "/Users/michaelmoore/Projects/att/test"
UNSTRUCTURED_API_KEY = "YOUR UNSTRUCTURED_API_KEY"
UNSTRUCTURED_API_URL = "https://api.unstructuredapp.io"

NEO4J_URI = "bolt://localhost:7687"
NEO4J_DATABASE = "neo4j"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "testtest"

OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

# Chunking and embedding are optional.

if __name__ == "__main__":
    Pipeline.from_configs(
        context=ProcessorConfig(),
        indexer_config=LocalIndexerConfig(input_path=(LOCAL_FILE_INPUT_DIR)),
        downloader_config=LocalDownloaderConfig(),
        source_connection_config=LocalConnectionConfig(),
        partitioner_config=PartitionerConfig(
            partition_by_api=True,
            api_key=(UNSTRUCTURED_API_KEY),
            partition_endpoint=UNSTRUCTURED_API_URL,
            additional_partition_args={
                "split_pdf_page": True,
                "split_pdf_allow_failed": True,
                "split_pdf_concurrency_level": 15
            }
        ),
        chunker_config=ChunkerConfig(chunking_strategy="by_title"),
#        embedder_config=EmbedderConfig(
#            embedding_provider="openai",
#            embedding_api_key=OPENAI_API_KEY
#        ),
        destination_connection_config=Neo4jConnectionConfig(
            access_config=Neo4jAccessConfig(password=NEO4J_PASSWORD),
            username=NEO4J_USERNAME,
            uri=NEO4J_URI,
            database=NEO4J_DATABASE,
        ),
        stager_config=Neo4jUploadStagerConfig(),
        uploader_config=Neo4jUploaderConfig(batch_size=100)
    ).run()

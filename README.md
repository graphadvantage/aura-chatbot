# aura-chatbot
GenAI Chatbot using Unstructured.io serverless API parsing of PDF documents and Neo4j GraphRAG Hybrid Vector+FullText Retrieval

### build the graph
Install python dependencies:

`pip install python-dotenv`

`pip install fastapi[standard]`

`pip install uvicorn`

`pip install openai`

`pip install unstructured_client`

`pip install unstructured_ingest`

`pip install neo4j`

`pip install neo4j-driver`

`pip install neo4j_graphrag`

`pip install neo4j_graphrag[openai]`

get an OpenAi API key https://openai.com/

get an Unstructured API key https://unstructured.io/

In Neo4j browser, paste and run `build-indexes.cyp`

Configure and run `part1-unstructured-chunking.py` python script

Configure and run `part2-openai-embedding.ipynb` Jupyter notebook


### start the back end
from /backend

add and configure .env file, following the .env.example template

`uvicorn app.main:app --reload`


### start the front end
from /frontend

add and configure .env file, following the .env.example template

`yarn install`

`sudo yarn run dev`

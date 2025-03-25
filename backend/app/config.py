import os
from dotenv import load_dotenv

# .env variables
load_dotenv()

# N4J Config
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

#LLM API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

#Vector Config
VECTOR_INDEX_NAME = os.getenv("VECTOR_INDEX_NAME")

# API Config
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
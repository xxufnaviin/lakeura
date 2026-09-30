import os
from dotenv import load_dotenv

load_dotenv()

# secret API key for LLM access
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
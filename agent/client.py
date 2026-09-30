
from groq import Groq
from config.agent import GROQ_MODEL
from config.secrets import GROQ_API_KEY

class LLM:

    # init LLM client using GROQ API
    def __init__(self):
        self.model = GROQ_MODEL
        self.client = Groq(api_key=GROQ_API_KEY)

    
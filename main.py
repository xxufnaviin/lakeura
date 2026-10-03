import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agent.agent import Lakeura
from models.api import ChatRequest

# starts agent with new session
agent = Lakeura()
lakeura = FastAPI()

# allow the local frontend to call the backend
lakeura.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# simple chat endpoint for frontend use
@lakeura.post("/chat")
async def chat(request: ChatRequest):
    result = await agent.chat(request.message)
    return {"response": result}

# runs a simple backend server to receive chat messages 
if __name__ == "__main__":
    uvicorn.run(lakeura, host="127.0.0.1", port=8080)
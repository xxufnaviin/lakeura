import asyncio
import langchain
from langchain.agents import create_agent
from langchain_core.messages import SystemMessage, HumanMessage

from agent.client import LLM

# to show output of agentic workflow
langchain.debug = True

# main agent lives here
class Lakeura:
    # create LLM client on agent initiliaztion
    def __init__(self):
        self.llm = LLM()
        self.mcp_client = self.llm.get_mcp_client()
        self.messages = [SystemMessage(content=self.llm.get_system_prompt())]

    # run agentic loop
    async def chat(self, user_message:str):
        # get tools from mcp client that is running
        tools = await self.mcp_client.get_tools()

        # check if LLM model is available
        if not self.llm.model:
            print("No models configured. Agent unable to start.")
            return

        # use langchain create agent function for agent with MCP tools exposure
        self.agent = create_agent(model = self.llm.model, tools = tools)

        # append user message into the chat with history
        self.messages.append(HumanMessage(content = user_message))

        # start the agentic loop (async invoke)
        # langchain handles iteration internally and ouputs final results
        result = await self.agent.ainvoke({"messages":self.messages})

        # appends the AIMessage() into list of messages for history maintaining
        self.messages.append(result["messages"][-1])

        # return only the content for frontend
        return result["messages"][-1].content
    
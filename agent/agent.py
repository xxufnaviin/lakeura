import asyncio
import langchain
from langchain.agents import create_agent

from agent.client import LLM

# to show output of agentic workflow
langchain.debug = True

# main agent lives here
class Lakeura:

    # create LLM client on agent initiliaztion
    def __init__(self):
        self.llm = LLM()
        self.prompt = self.llm.get_prompt()
        self.mcp_client = self.llm.get_mcp_client()


    # run agentic loop
    async def start_agent(self, user_message:str):
        # get tools from mcp client that is running
        tools = await self.mcp_client.get_tools()

        # use langchain create agent function for agent with MCP tools exposure
        self.agent = create_agent(model = self.llm.model, tools = tools)

        # append user message into the chat template
        messages = self.prompt.format_messages(input=user_message)

        # start the agentic loop (async invoke)
        # langchain handles iteration internally and ouputs final results
        result = await self.agent.ainvoke({"messages": messages})

        return result
    
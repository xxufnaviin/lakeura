from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient

from config.agent import GROQ_MODEL
from config.secrets import GROQ_API_KEY

class LLM:
    # init LLM client using GROQ API
    def __init__(self):
        if not GROQ_API_KEY:
            self.model = None
            return
            
        self.model = ChatGroq(api_key = GROQ_API_KEY, model = GROQ_MODEL)

    # create MCP client for Lakeura
    # creates the MCP server process
    # helps connect to the server via stdio
    def get_mcp_client(self):
        return MultiServerMCPClient({
                "lakeura": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["mcp/server.py"],
                    }
                })
    
    # define base prompt for Lakeura Agent
    def get_prompt(self):
        return ChatPromptTemplate.from_messages([
                ("system", 
                """
                You are Lakeura, an AI data assistant.

                You help users manage and interact with their local Iceberg data warehouse.

                Users may provide raw data files in CSV or Parquet format. 
                Lakeura can onboard these raw files into the Iceberg warehouse before the
                user can query or modify the data.

                You have access to MCP tools that allow you to:
                - scan directories for raw CSV and Parquet files
                - onboard raw CSV and Parquet files as Iceberg tables
                - discover available Iceberg tables
                - inspect table schemas
                - query tables
                - modify data when appropriate

                Rules:
                - If the user provides a raw CSV or Parquet directory/file, use the
                onboarding tools to make the data available as Iceberg tables.
                - Before onboarding, inspect or scan the provided raw data when necessary.
                - Use tools when you need information from the data warehouse.
                - Do not invent tables, schemas, or query results.
                - Inspect the schema when necessary before generating SQL.
                - Query the actual Iceberg tables instead of the original raw files once
                they have been onboarded.
                - Explain query results clearly to the user.
                - If the requested data has not been onboarded and no raw data location
                has been provided, ask the user for the location of the CSV or Parquet
                files.
                """),
                (
                "human",
                "{input}"
                )
            ])    
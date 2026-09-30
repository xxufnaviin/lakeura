from agent.client import LLM

# main agent lives here
# workflow and stuff
class Lakeura:

    # create LLM client on agent initiliaztion
    def __init__(self):
        self.client = LLM()

    # run agentic loop
    def start_agent(self, user_message:str):
        pass
    pass
import asyncio
import sys
from agent.agent import Lakeura

# uses the selector loop instead of the Proactor loop.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(
        asyncio.WindowsSelectorEventLoopPolicy()
    )


# intialize agent
agent = Lakeura()

# result = asyncio.run(agent.start_agent("Can you onboard tables for me @ C:\\Users\\User\\Documents\\My-Projects\\Data-Engineering\\lakeura\\data\\raw"))
result = asyncio.run(agent.start_agent("how many customers churned in `telecom_churn`?"))
print(result)
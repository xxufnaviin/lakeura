# 🌊 Lakeura °‧ 𓆝 𓆟 𓆞 ·｡
AI agent that turns raw data into a queryable lakehouse, enabling natural language interaction with your raw data

---

## 🚨 Problem Statement

Asking AI tools like *Claude* or *Codex* to query your CSV files works — but only up to a point. They generate a **one-off script**, run it, and give you an answer. What they won't do is **manage your data**. There's no persistent storage, no schema, no ability to update a row or track changes. Every session starts from scratch and your data **never graduates beyond a flat file**.

Lakeura solves this by giving the AI a **real data warehouse** to work against — not a generated script, but actual **managed Iceberg tables** it can query, insert into, update, and reason about *across sessions*.

---

## 💡 Solution

Lakeura is a **local AI data assistant**. Point it at a directory of raw **CSV or Parquet files** and it onboards them into a local Apache Iceberg warehouse *automatically*. From there you interact with your data in **plain English** — the agent handles schema inference, SQL generation, and result interpretation. Everything runs **locally**, *nothing leaves your machine*.

**🏔️ Why Iceberg?**
Apache Iceberg is a table format designed for **large analytic datasets** — it sits on top of the local filesystem and gives you **real database semantics** without a running database server. That means full SQL support, **schema enforcement**, **ACID transactions**, and row-level updates on your local files. Unlike querying a CSV directly, Iceberg tables *persist across sessions*, track schema changes, and support operations like `UPDATE` and `INSERT` properly. It is the reason Lakeura can **manage your data** rather than just read it once.

---

## 🛠️ Tech Stack

### 🏗️ High-Level Architecture
<img width="1280" height="585" alt="lakeura" src="https://github.com/user-attachments/assets/909b79b2-2ef6-4bc5-8849-6ea166e64f6f" />
<br></br>

| Layer | Technology |
|---|---|
| 🤖 AI Agent | LangGraph + LangChain |
| ⚡ LLM | Groq API (`openai/gpt-oss-120b`) |
| 🔌 Tool Protocol | Model Context Protocol (MCP) via `fastmcp` |
| 🏔️ Data Lakehouse | Apache Iceberg + HDFS |
| ⚙️ Query Engine | Apache Spark via `pyspark` |
| 🌐 Backend API | FastAPI + Uvicorn |
| 🖥️ Desktop UI | Electron + React + Vite |

---

## 📁 Project Structure

```
lakeura/
├── main.py                  # FastAPI backend — exposes /chat
├── mcp/
│   └── server.py            # FastMCP server — exposes Iceberg tools over HTTP
├── agent/
│   ├── agent.py             # LangGraph agentic loop
│   └── client.py            # Groq LLM client + MCP client config
├── data_service/
│   ├── iceberg/catalog.py   # Iceberg operations (onboard, query, insert, update)
│   └── spark/session.py     # PySpark session with Iceberg catalog config
├── config/
│   ├── agent.py             # Model name
│   ├── data_service.py      # Catalog name, namespace, supported formats
│   └── secrets.py           # Loads env vars
├── models/
│   └── api.py               # Pydantic request models
├── frontend/
│   ├── electron/main.js     # Electron BrowserWindow
│   ├── src/                 # React app (components, hooks, styles)
│   └── package.json
├── Lakeura.bat              # Windows launcher
└── requirements.txt
```

---

## 🚀 Getting Started

> ⚠️ **Developer preview** — Lakeura currently requires manual environment setup (JDK, Hadoop winutils, environment variables). It is intended for developers comfortable configuring these dependencies. A non-technical user-friendly version is not yet available.

### ✅ Prerequisites

- **Python 3.10** — must be installed and accessible via the `py` launcher (`py -3.10`)
- **Node.js 18+** — for the Electron/React frontend
- **JDK 17** — required by PySpark/Spark; set `JAVA_HOME` to your JDK 17 installation (e.g. `C:\Program Files\Java\jdk-17`)
- **Hadoop winutils** — Spark on Windows requires `winutils.exe` for the Hadoop version bundled with PySpark; set `HADOOP_HOME` to a directory containing `bin\winutils.exe` ([winutils releases](https://github.com/cdarlint/winutils))
- **Apache Spark** — bundled automatically via `pyspark==4.2.0`; no separate Spark install needed
- A [Groq API key](https://console.groq.com)

> **Environment variables** — add these to your system or user environment before running:
> ```
> JAVA_HOME=C:\Program Files\Java\jdk-17
> HADOOP_HOME=C:\hadoop
> PATH=%PATH%;%JAVA_HOME%\bin;%HADOOP_HOME%\bin
> ```

### 1. 🔑 Configure environment

```bash
cp .env.example .env
```

Then open `.env` and fill in your Groq API key.

### 2. ▶️ Run

```bat
.\Lakeura.bat
```

The launcher will:
1. Create a Python virtual environment (`.venv`)
2. Install all dependencies from `requirements.txt`
3. Start the MCP server on `http://127.0.0.1:8000` (background)
4. Start the FastAPI backend on `http://127.0.0.1:8080` (background)
5. Open the Lakeura desktop application

### 3. 💬 Use it

- Tell Lakeura where your files are: *"onboard the files at C:/data/sales"*
- Query: *"show me total revenue by region for last quarter"*
- Modify: *"update the status to closed for order id 1042"*
- Explore: *"what tables do I have?"*, *"describe the orders table"*

---

## 🔧 MCP Tools

| Tool | Description |
|---|---|
| `list_tables` | List all tables in the Iceberg catalog |
| `get_catalog` | Get the catalog and namespace prefix for queries |
| `describe_table` | Get column names and data types for a table |
| `query` | Execute a read-only SQL query |
| `onboard_tables` | Ingest CSV / Parquet files as Iceberg tables |
| `insert_data` | Insert a single row into a table |
| `update_data` | Update rows matching a SQL WHERE condition |
| ... | *more tools coming soon* |

---

## 📋 Logs

Server output is written to `logs/mcp.log` and `logs/backend.log`.

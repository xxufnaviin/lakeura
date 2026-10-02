from fastmcp import FastMCP
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from data_service.iceberg.catalog import IcebergCatalog

catalog = IcebergCatalog()
mcp = FastMCP("Lakeura")

## mcp function wrapper for catalogs tools
@mcp.tool
def list_tables() -> dict:
    """List all tables available in the default Iceberg namespace. Can use to check if tables are onboarded or not.
    Can be used to get table names for querying
    Returns table names and total count."""
    return catalog.list_tables()

@mcp.tool
def query(sql: str) -> dict:
    """Execute a read-only SQL query against the Iceberg catalog. Use catalog.namespace.table
    Returns columns, rows as dicts, and row count."""
    return catalog.query(sql)

@mcp.tool
def insert_data(table: str, data: dict) -> dict:
    """Insert a single row into an Iceberg table. 
    Provide the table name and a dict mapping column names to values."""
    return catalog.insert_data(table, data)


@mcp.tool
def update_data(table: str, data: dict, condition: str) -> dict:
    """Update rows in an Iceberg table matching a SQL WHERE condition. 
    Provide the table name, a dict of column/value updates, and the condition string (e.g. 'id = 42')."""
    return catalog.update_data(table, data, condition)

@mcp.tool
def onboard_tables(file_path: str) -> dict:
    """Scan a raw directory and onboard CSV or Parquet files as Iceberg tables. 
    Returns the number of tables created or replaced."""
    return catalog.onboard_tables(file_path)

@mcp.tool
def get_catalog() -> dict:
    """Get default catalog and namespace name for querying tables, as an prefix for tables
    Returns the catalog name and namespace name"""
    return catalog.get_catalog()

@mcp.tool
def describe_table(table_name: str) -> dict:
    """Get the schema of an Iceberg table. Use this tool when you need to know the table's columns and data types
    before generating a query."""
    return catalog.describe_table(table_name)

# runs server here separately
# communicates via http with langchain llm client
if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        host="127.0.0.1",
        port=8000
    )

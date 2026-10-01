from fastmcp import FastMCP

from data_service.iceberg.catalog import IcebergCatalog

catalog = IcebergCatalog()
catalog.initialize()
mcp = FastMCP("Lakeura")

## mcp function wrapper for catalogs tools
@mcp.tool
def list_tables() -> dict:
    """List all tables available in the default Iceberg namespace. 
    Returns table names and total count."""
    return catalog.list_tables()

@mcp.tool
def query(sql: str) -> dict:
    """Execute a read-only SQL query against the Iceberg catalog. 
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

# runs server here via langchain func (stdio)
# communicates via stdio with langchain llm client
if __name__ == "__main__":
    mcp.run(transport="stdio")

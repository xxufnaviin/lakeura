# run server here
from fastmcp import FastMCP

from data_service.iceberg.catalog import IcebergCatalog

catalog = IcebergCatalog()
mcp = FastMCP("Lakeura")

## mcp function wrapper for catalogs tools

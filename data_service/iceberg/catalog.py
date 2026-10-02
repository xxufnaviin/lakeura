# main wrapper functions here
from data_service.spark.session import create_spark
from data_service.utils import scan_raw_directory, unpack_values, unpack_updates
from config.data_service import ICEBERG_CATALOG, DEFAULT_NAMESPACE


class IcebergCatalog:
    # initialize spark session with Iceberg Catalog
    def __init__(self):
        self.catalog = ICEBERG_CATALOG
        self.namespace = DEFAULT_NAMESPACE
        self.session = create_spark(catalog_name=self.catalog)

    def get_catalog(self):
        return {
            "catalog":self.catalog,
            "namespace": self.namespace
        }

    def execute(self, query:str):
        table = self.session.sql(query)
        rows = table.collect()

        return table, rows
    
    def onboard_tables(self, file_path:str):
        sources = scan_raw_directory(file_path)
        for source in sources:
            if source["format"] == "csv":
                df = self.session.read.csv(source["path"], header=True, inferSchema=True)

            elif source["format"] == "parquet":
                df = self.session.read.parquet(source["path"])

            # creates Iceberg tables from raw data files
            table = f"{self.catalog}.{self.namespace}.{source['table_name']}"
            df.writeTo(table).createOrReplace()

        return {
            "status": "success",
            "operation": "onboard_tables",
            "tables_onboarded": len(sources)
        }
            
    def list_tables(self):
        query = f"SHOW TABLES in {self.catalog}.{self.namespace}"
        _, rows = self.execute(query)

        return {
            "tables": [row["tableName"] for row in rows],
            "count": len(rows)
        }

    def query(self, query:str):
        table, rows = self.execute(query)

        return {
            "columns": table.columns,
            "rows": [row.asDict() for row in rows],
            "row_count": len(rows)
        }

    def insert_data(self, table:str, data:dict):
        # column:value pair (data)
        columns, values = unpack_values(data)
        query = f"""INSERT INTO {self.catalog}.{self.namespace}.{table} ({", ".join(columns)}) 
                    VALUES ({values})"""
        
        self.execute(query)

        return  {
            "status": "success",
            "operation": "insert_data",
        }

    def update_data(self, table: str, data: dict, condition: str):
        # column:value (data)
        updates = unpack_updates(data)

        query = f"""
            UPDATE {self.catalog}.{self.namespace}.{table}
            SET {updates}
            WHERE {condition}
        """

        self.execute(query)

        return  {
            "status": "success",
            "operation": "insert_data",
        }
    
    def describe_table(self, table_name: str):
        df = self.session.table(table_name)

        return {
            "table": table_name,
            "columns": [
                {
                    "name": field.name,
                    "type": str(field.dataType)
                }
                for field in df.schema.fields
            ]
        }
    
    # add_column(table, ...)
    # drop_column(table, ...)
    # get_table_history(table)

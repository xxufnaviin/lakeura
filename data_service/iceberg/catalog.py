# main wrapper functions here
from data_service.spark.session import create_spark
from data_service.utils import scan_raw_directory, unpack_values, unpack_updates
from data_service.config import ICEBERG_CATALOG, DEFAULT_NAMESPACE


class IcebergCatalog:
    # initialize spark session with Iceberg Catalog
    def initialize(self):
        self.catalog = ICEBERG_CATALOG
        self.namespace = DEFAULT_NAMESPACE
        self.session = create_spark(catalog_name=self.catalog)

    def execute(self, query:str):
        return self.session.sql(query)
    
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
            

    def list_tables(self):
        query = f"SHOW TABLES in {self.catalog}.{self.namespace}"

        return self.execute(query)

    def query(self, query:str):
        return self.execute(query)

    def insert_data(self, table:str, data:dict):
        columns, values = unpack_values(data)
        query = f"""INSERT INTO {self.catalog}.{self.namespace}.{table} ({", ".join(columns)}) 
                    VALUES ({values})"""

        return self.execute(query)

    def update_data(self, table: str, data: dict, condition: str):
        updates = unpack_updates(data)

        query = f"""
            UPDATE {self.catalog}.{self.namespace}.{table}
            SET {updates}
            WHERE {condition}
        """

        return self.execute(query)
    
    # add_column(table, ...)
    # drop_column(table, ...)
    # get_table_history(table)

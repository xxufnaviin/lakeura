# main wrapper functions here
from data_service.spark.session import create_spark
from data_service.utils import scan_raw_directory
from data_service.config import ICEBERG_CATALOG


class IcebergCatalog:
    # initialize spark session with Iceberg Catalog
    def initialize(self):
        self.catalog = ICEBERG_CATALOG
        self.session = create_spark(catalog_name=self.catalog)
    
    def onboard_tables(self, file_path:str):
        sources = scan_raw_directory(file_path)
        for source in sources:
            if source["format"] == "csv":
                df = self.session.read.csv(source["path"], header=True, inferSchema=True)

            elif source["format"] == "parquet":
                df = self.session.read.parquet(source["path"])

            # creates Iceberg tables from raw data files
            table = f"{self.catalog}.default.{source['table_name']}"
            df.writeTo(table).createOrReplace()
            

    def fetch_tables(self):
        query = f"SHOW TABLES in {self.catalog}.default"

        return self.session.sql(query)

    def query(self, query:str):
        return self.session.sql(query)

    
    # list_tables()
    # describe_table(table)
    # query_table(table, sql)
    # insert_data(table, ...)
    # update_data(table, ...)
    # delete_data(table, ...)
    # add_column(table, ...)
    # drop_column(table, ...)
    # get_table_history(table)

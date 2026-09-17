# main wrapper functions here
from spark.session import create_spark
from config import ICEBERG_CATALOG

class IcebergCatalog:
    # initialize spark session with Iceberg Catalog
    def initialize(self):
        self.session = create_spark(catalog_name=ICEBERG_CATALOG)
    
    def create_table():
        pass

    def fetch_tables():
        pass

    def query(self, query:str):
        return self.session.sql(query)

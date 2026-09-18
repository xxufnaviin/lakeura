# main wrapper functions here
from spark.session import create_spark
from utils import scan_raw_directory
from config import ICEBERG_CATALOG


class IcebergCatalog:
    # initialize spark session with Iceberg Catalog
    def initialize(self):
        self.session = create_spark(catalog_name=ICEBERG_CATALOG)
    
    def onboard_tables(self, file_path:str):
        sources = scan_raw_directory(file_path)
        for source in sources:
            if source["format"] == "csv":
                df = self.session.read.csv(source["path"], header=True, inferSchema=True)

            elif source["format"] == "parquet":
                df = self.session.read.parquet(source["path"])

            # creates Iceberg tables from raw data files
            df.writeTo(source["table_name"]).createOrReplace()
            

    def fetch_tables():
        pass

    def query(self, query:str):
        return self.session.sql(query)

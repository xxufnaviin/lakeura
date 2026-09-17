from pyspark.sql import SparkSession
from utils import get_warehouse_path




def create_spark(catalog_name:str):
    warehouse = get_warehouse_path().as_uri()
    catalog = f"spark.sql.catalog.{catalog_name}"
    catalog_type = f"spark.sql.catalog.{catalog_name}.type"
    catalog_warehouse = f"spark.sql.catalog.{catalog_name}.warehouse"

    return SparkSession.builder.appName(catalog_name)\
        .config("spark.jars.packages", "org.apache.iceberg:iceberg-spark-runtime-4.0_2.13:1.10.0")\
        .config("spark.sql.defaultCatalog", catalog_name)\
        .config(catalog,"org.apache.iceberg.spark.SparkCatalog")\
        .config(catalog_type, "hadoop")\
        .config(catalog_warehouse, warehouse)\
        .getOrCreate()
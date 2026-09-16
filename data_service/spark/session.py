from pyspark.sql import SparkSession
from utils import get_warehouse_path




def create_spark():
    warehouse = get_warehouse_path().as_uri()

    return SparkSession.builder.appName("Lakeura")\
        .config("spark.jars.packages", "org.apache.iceberg:iceberg-spark-runtime-4.0_2.13:1.10.0")\
        .config("spark.sql.catalog.lakeura","org.apache.iceberg.spark.SparkCatalog")\
        .config("spark.sql.catalog.lakeura.type", "hadoop")\
        .config("spark.sql.catalog.lakeura.warehouse", warehouse)\
        .getOrCreate()
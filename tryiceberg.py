from data_service.iceberg.catalog import IcebergCatalog

catalog = IcebergCatalog()
catalog.initialize()


# catalog.onboard_tables(r"C:\Users\User\Documents\My-Projects\Data-Engineering\lakeura\data\raw")
catalog.query("SELECT * from imdb;").show()
from pathlib import Path
from data_service.config import SUPPORTED_FORMATS

def get_warehouse_path():
    return Path("data/warehouse").resolve()

def scan_raw_directory(raw_path: str):
    raw_dir = Path(raw_path).resolve()
    sources = []

    for path in raw_dir.iterdir():

        # root level csv/parquet files
        # add to sources as separate tables
        if path.is_file() and path.suffix.lower() in SUPPORTED_FORMATS:
            sources.append({
                "path": str(path),
                "format": path.suffix.lower().lstrip("."),
                "table_name": path.stem
            })

        # subfolder containing supported files
        # if the path is dir
        # like rawdata/dir1 instead of rawdata/example.csv
        # then if they contain csv or parquet files, add the dir as path
        # so 1 directory = 1 table
        elif path.is_dir():
            files = [
                f for f in path.iterdir()
                if f.is_file() and f.suffix.lower() in SUPPORTED_FORMATS
            ]

            if files:
                formats = {f.suffix.lower() for f in files}

                # all files in one dir should be the same format
                if len(formats) == 1:
                    file_format = formats.pop()

                    sources.append({
                        "path": str(path),
                        "format": file_format.lstrip("."),
                        "table_name": path.name
                    })

    return sources
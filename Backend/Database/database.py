import time
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():
    attempts = 0
    while attempts < 5:
        try:
            conn = psycopg2.connect(
                dsn=f"postgres://root@{os.getenv('DB_HOST', 'localhost')}:26257/state_database",
                cursor_factory=RealDictCursor,
            )
            return conn
        except psycopg2.OperationalError as e:
            print(f"Failed to connect to the database, retrying... ({attempts + 1})")
            time.sleep(5)  # wait for 5 seconds before retrying
            attempts += 1
    raise Exception("Failed to connect to the database after several attempts")

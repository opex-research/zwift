import os
import psycopg2
from psycopg2.extras import RealDictCursor

DB_HOST = os.getenv("DB_HOST", "localhost")
DATABASE_URL = f"postgres://root@{DB_HOST}:26257/state_database"
print("Database Host:", DB_HOST)


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

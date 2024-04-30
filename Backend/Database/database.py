import psycopg2
from psycopg2.extras import RealDictCursor
import os

DB_HOST = os.getenv("DB_HOST", "localhost")

# Connection parameters
DATABASE_URL = f"postgres://root@{DB_HOST}:26257/state_database"


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

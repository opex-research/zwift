import psycopg2
from psycopg2.extras import RealDictCursor

# Connection parameters
DATABASE_URL = "postgres://root@127.0.0.1:26257/state_database"


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

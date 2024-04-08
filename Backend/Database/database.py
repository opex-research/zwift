import psycopg2
from psycopg2.extras import RealDictCursor

# Connection parameters
DATABASE_URL = "postgres://main_user:test_password@localhost:26257/state_database?sslmode=disable"

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

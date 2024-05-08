import os
import psycopg2

def setup_database():
    db_host = os.getenv("DB_HOST", "localhost")

    # Connect to the default system database to check for existing databases
    conn = psycopg2.connect(
        dbname="postgres",  # Default system database for PostgreSQL, adjust if needed for CockroachDB
        user="root", 
        host=db_host, 
        port="26257", 
        sslmode="disable"
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Check if the 'state_database' exists
    cur.execute("SELECT 1 FROM pg_database WHERE datname='state_database';")
    exists = cur.fetchone()

    # Create the database if it doesn't exist
    if not exists:
        cur.execute("CREATE DATABASE state_database;")
        print("Database 'state_database' created")
    else:
        print("Database 'state_database' already exists")

    cur.close()
    conn.close()

def create_tables():
    db_host = os.getenv("DB_HOST", "localhost")

    # Connection parameters using environment variables
    params = {
        "database": "state_database",
        "user": "root",
        "host": db_host,
        "port": "26257",
        "sslmode": "disable",
    }

    transactions_table = """
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        wallet_address TEXT,
        transaction_hash TEXT,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('register', 'onramp', 'offramp')),
        transaction_status TEXT NOT NULL CHECK (transaction_status IN ('pending', 'success', 'failed')),
        created_at TIMESTAMPTZ DEFAULT now()
    );
    """

    openonramps_table = """
    CREATE TABLE IF NOT EXISTS openonramps (
        id SERIAL PRIMARY KEY,
        wallet_address TEXT UNIQUE NOT NULL,
        transaction_hash TEXT UNIQUE NOT NULL,
        added_at TIMESTAMPTZ DEFAULT now()
    );
    """

    # Connect to CockroachDB
    conn = psycopg2.connect(**params)
    cur = conn.cursor()

    # Execute the table creation statements
    try:
        cur.execute(transactions_table)
        cur.execute(openonramps_table)
        conn.commit()  # Commit the transaction
        print("Tables created successfully")
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()  # Roll back the transaction on error
    finally:
        # Close the cursor and the connection
        cur.close()
        conn.close()

if __name__ == "__main__":
    setup_database()
    create_tables()

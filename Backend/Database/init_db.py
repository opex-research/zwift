import os
import psycopg2
from psycopg2 import sql


# Function to setup the database
def setup_database():
    db_host = os.getenv(
        "DB_HOST", "localhost"
    )  # Default to localhost for local development

    conn = psycopg2.connect(
        dbname="state_database",  # Connect to the default database
        user="root",  # Default user for CockroachDB
        host=db_host,  # Use environment variable
        port="26257",  # Default CockroachDB port
        sslmode="disable",  # Disable SSL for local connection, adjust as needed for production
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Create the 'state_database' database
    cur.execute("CREATE DATABASE IF NOT EXISTS state_database;")

    cur.close()
    conn.close()


# Function to create tables
def create_tables():
    db_host = os.getenv(
        "DB_HOST", "localhost"
    )  # Default to localhost for local development

    # Connection parameters using environment variables
    params = {
        "database": "state_database",
        "user": "root",
        "host": db_host,  # Use environment variable
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


# Main execution
if __name__ == "__main__":
    setup_database()
    create_tables()

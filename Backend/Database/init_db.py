# init_db.py
import psycopg2
from psycopg2 import sql


def create_tables():
    # Connection parameters
    params = {
        "database": "state_database",
        "user": "main_user",
        "password": "test_password",
        "host": "127.0.0.1",
        "port": "26257",  # default CockroachDB port
        "sslmode": "disable",  # if SSL is required
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

    # Connect to CockroachDB
    conn = psycopg2.connect(**params)
    cur = conn.cursor()

    # Execute the table creation statements
    try:
        cur.execute(transactions_table)
        conn.commit()  # Commit the transaction
        print("Table created successfully")
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()  # Roll back the transaction on error
    finally:
        # Close the cursor and the connection
        cur.close()
        conn.close()


if __name__ == "__main__":
    create_tables()

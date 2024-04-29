from fastapi import FastAPI, Depends, HTTPException, status
import database
from schemas import TransactionBase, OnrampBase
from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi.responses import JSONResponse
from sync_transaction_statuses import fetch_newest_zksync_transaction_status

app = FastAPI()

logging.basicConfig(level=logging.INFO)

# For development, you might allow all origins. Be more restrictive for production.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://python-backend:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


async def update_transaction_statuses():
    """Fetch all pending transactions from the database, fetch their transaction status from the zkSync layer, 
    update the status in the database depending on the newly fetched zksync transaction status

    Raises:
        HTTPException: _description_

    Returns:
        dict: key=message; value=amount of updated transactions
    """ """Update statuses of all pending transactions by checking the latest status from the blockchain."""
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        # Fetch all pending transactions
        cur.execute(
            "SELECT id, transaction_hash FROM transactions WHERE transaction_status = 'pending'"
        )
        pending_transactions = cur.fetchall()

        # If there are no pending transactions, return an informative message
        if not pending_transactions:
            return {"message": "No pending transactions to update."}

        # Fetch new statuses for each transaction
        transaction_ids = [tx["transaction_hash"] for tx in pending_transactions]
        new_statuses = fetch_newest_zksync_transaction_status(transaction_ids)

        # Update transactions in the database with new statuses
        updated_count = 0
        for tx in pending_transactions:
            new_status = new_statuses.get(tx["transaction_hash"])
            if (
                new_status and new_status != "pending"
            ):  # Check if the status has changed and is not pending
                cur.execute(
                    "UPDATE transactions SET transaction_status = %s WHERE id = %s",
                    (new_status, tx["id"]),
                )
                updated_count += 1

        conn.commit()  # Commit all changes at once
        return {"message": f"Updated {updated_count} transactions."}

    except Exception as e:
        conn.rollback()  # Roll back in case of any error
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.post("/transactions/{wallet_address}/update_transaction_status")
async def update_transaction_statuses_for_account(wallet_address: str):
    """
    Endpoint to update transaction statuses for a specific wallet address by checking the latest status from the blockchain.

    Args:
        wallet_address (str): Wallet address for which transactions need to be updated

    Returns:
        JSONResponse: Returns a message with the count of transactions that were updated
    """
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        # Fetch all pending transactions for the specified wallet address
        cur.execute(
            "SELECT id, transaction_hash FROM transactions WHERE transaction_status = 'pending' AND wallet_address = %s",
            (wallet_address,),
        )
        pending_transactions = cur.fetchall()

        # If there are no pending transactions, return an informative message
        if not pending_transactions:
            return JSONResponse(
                status_code=200,
                content={"message": "No pending transactions to update."},
            )

        # Fetch new statuses for each transaction
        transaction_ids = [tx["transaction_hash"] for tx in pending_transactions]
        new_statuses = fetch_newest_zksync_transaction_status(transaction_ids)

        # Update transactions in the database with new statuses
        updated_count = 0
        for tx in pending_transactions:
            new_status = new_statuses.get(tx["transaction_hash"])
            if (
                new_status and new_status != "pending"
            ):  # Check if the status has changed and is not pending
                cur.execute(
                    "UPDATE transactions SET transaction_status = %s WHERE id = %s",
                    (new_status, tx["id"]),
                )
                updated_count += 1

        conn.commit()  # Commit all changes at once
        return JSONResponse(
            status_code=200,
            content={"message": f"Updated {updated_count} transactions."},
        )

    except Exception as e:
        conn.rollback()  # Roll back in case of any error
        return JSONResponse(
            status_code=500, content={"message": f"An error occurred: {str(e)}"}
        )
    finally:
        cur.close()
        conn.close()


'''
async def update_transaction_statuses_for_account(wallet_address: str):
    """Fetch all pending transactions from the database, fetch their transaction status from the zkSync layer, 
    update the status in the database depending on the newly fetched zksync transaction status

    Raises:
        HTTPException: _description_

    Returns:
        dict: key=message; value=amount of updated transactions
    """ """Update statuses of all pending transactions by checking the latest status from the blockchain."""
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        # Fetch all pending transactions
        cur.execute(
            "SELECT id, transaction_hash FROM transactions WHERE transaction_status = 'pending' AND wallet_address = %s",
            (wallet_address,),
        )
        pending_transactions = cur.fetchall()

        # If there are no pending transactions, return an informative message
        if not pending_transactions:
            return {"message": "No pending transactions to update."}

        # Fetch new statuses for each transaction
        transaction_ids = [tx["transaction_hash"] for tx in pending_transactions]
        new_statuses = fetch_newest_zksync_transaction_status(transaction_ids)

        # Update transactions in the database with new statuses
        updated_count = 0
        for tx in pending_transactions:
            new_status = new_statuses.get(tx["transaction_hash"])
            if (
                new_status and new_status != "pending"
            ):  # Check if the status has changed and is not pending
                cur.execute(
                    "UPDATE transactions SET transaction_status = %s WHERE id = %s",
                    (new_status, tx["id"]),
                )
                updated_count += 1

        conn.commit()  # Commit all changes at once
        return {"message": f"Updated {updated_count} transactions."}

    except Exception as e:
        conn.rollback()  # Roll back in case of any error
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
'''


@app.get("/transactions/{wallet_address}/registration_status")
def get_register_status(wallet_address: str):
    """Retrieves registration status from database for a given wallet address and returns it

    Args:
        wallet_address (str): Wallet address for which the registration status should be checked

    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        dict: key="registration_status"; value="pending";"registered";"not_registered"
    """
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        print(wallet_address)
        cur.execute(
            "SELECT * FROM transactions WHERE wallet_address = %s AND transaction_type = 'register'",
            (wallet_address,),
        )
        transactions = cur.fetchall()
        print(transactions)
        # Check if there are no transactions first
        if not transactions:
            return {"registration_status": "not_registered"}

        # Now, it's safe to assume transactions is not empty
        if len(transactions) > 1:
            raise HTTPException(
                status_code=404,
                detail="Duplicate entries for registration transaction, contact support",
            )

        # Assuming you're using RealDictCursor or similar to access columns by name
        if transactions[0]["transaction_status"] == "success":
            return {"registration_status": "registered"}
        elif transactions[0]["transaction_status"] == "pending":
            return {"registration_status": "pending"}
        else:
            return {"registration_status": "not_registered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# Helper function to simulate an update from the blcokcchain
@app.put("/transactions/{wallet_address}/update_registration_status")
def update_register_status(wallet_address: str):
    """Helper function that will is only needed for local deployment

    Args:
        wallet_address (str): _description_

    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        _type_: _description_
    """
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:

        cur.execute(
            "SELECT id FROM transactions WHERE wallet_address = %s AND transaction_type = 'register' AND transaction_status = 'pending'",
            (wallet_address,),
        )
        transaction = cur.fetchone()

        # Step 2: If a pending registration transaction exists, update it to 'success'
        if transaction:
            cur.execute(
                "UPDATE transactions SET transaction_status = 'success' WHERE id = %s",
                (transaction["id"],),  # Assuming you're using RealDictCursor or similar
            )
            conn.commit()  # Don't forget to commit the transaction to make the update permanent
            return {"message": "Registration status updated to success."}
        else:
            raise HTTPException(
                status_code=404,
                detail="No pending registration transactions found for this wallet address.",
            )

    except Exception as e:
        conn.rollback()  # Roll back in case of any error
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# Helper function to simulate an update from the blcokcchain on all registrations
@app.put("/transactions/{wallet_address}/update_all_transactions")
def update_register_status(wallet_address: str):
    """Helper function that will is only needed for local deployment

    Args:
        wallet_address (str): _description_

    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        _type_: _description_
    """
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:

        cur.execute(
            "SELECT id FROM transactions WHERE wallet_address = %s AND transaction_status = 'pending'",
            (wallet_address,),
        )
        transaction = cur.fetchone()

        # Step 2: If a pending registration transaction exists, update it to 'success'
        if transaction:
            cur.execute(
                "UPDATE transactions SET transaction_status = 'success' WHERE id = %s",
                (transaction["id"],),  # Assuming you're using RealDictCursor or similar
            )
            conn.commit()  # Don't forget to commit the transaction to make the update permanent
            return {"message": "All transactions status updated to success."}
        else:
            raise HTTPException(
                status_code=404,
                detail="No pending transactions found for this wallet address.",
            )

    except Exception as e:
        conn.rollback()  # Roll back in case of any error
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.get("/transactions/{wallet_address}/pending")
def get_pending_transactions(wallet_address: str):
    """Returns all pending transactions for a given wallet address

    Args:
        wallet_address (str): wallet address to search transactions for

    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        dict: key="pending_transactions"; value=transactions (id, wallet_address, hash, status, timestamp)
    """
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT * FROM transactions WHERE wallet_address = %s AND transaction_status = 'pending'",
            (wallet_address,),
        )
        transactions = cur.fetchall()
        if not transactions:
            raise HTTPException(
                status_code=404,
                detail="No pending transactions found for this wallet address",
            )
        return {"pending_transactions": transactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    pass


@app.get("/transactions/{wallet_address}/pending_offramps")
def get_pending_transactions(wallet_address: str):
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT * FROM transactions WHERE wallet_address = %s AND transaction_status = 'pending' AND transaction_type = 'offramp'",
            (wallet_address,),
        )
        transactions = cur.fetchall()
        # Instead of raising an HTTPException for no results, return an empty list.
        return {"pending_transactions": transactions if transactions else []}
    except Exception as e:
        # It's good to log the exception here to understand what went wrong.
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


###########################################################
# Implement function to fetch all statuses from the pending transactions and update them if the status changed in the blockchain
# We will immitate that with a function sets sets all pending transactions to true for the local development
###########################################################


@app.post(
    "/transactions/",
    response_model=TransactionBase,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(transaction: TransactionBase):
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        print("trying to write transaction into databse")
        cur.execute(
            "INSERT INTO transactions (wallet_address, transaction_hash, transaction_type, transaction_status) VALUES (%s, %s, %s, %s) RETURNING *;",
            (
                transaction.wallet_address,
                transaction.transaction_hash,
                transaction.transaction_type,
                transaction.transaction_status,
            ),
        )

        new_transaction = cur.fetchone()
        print(new_transaction)
        conn.commit()
        return TransactionBase(
            wallet_address=new_transaction["wallet_address"],
            transaction_hash=new_transaction["transaction_hash"],
            transaction_type=new_transaction["transaction_type"],
            transaction_status=new_transaction["transaction_status"],
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    finally:
        cur.close()
        conn.close()
    pass


@app.post("/wallets/", status_code=status.HTTP_201_CREATED)
def add_wallet_address(onramp_data: OnrampBase):
    off_ramp_wallet_address = (
        onramp_data.wallet_address.lower()
    )  # Normalize to lowercase

    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        sql = "INSERT INTO openonramps (wallet_address, transaction_hash) VALUES (%s, %s);"
        params = (off_ramp_wallet_address, "0")  # Initialize transaction_hash with 0

        cur.execute(sql, params)
        conn.commit()  # Only commit if no exceptions occurred

        logging.info("Wallet address added successfully.")
        return {"message": "Wallet address added successfully to onramps database"}

    except Exception as e:
        conn.rollback()  # Rollback in case of any error
        logging.error(f"Error adding wallet address: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    finally:
        cur.close()
        conn.close()


@app.put("/wallets/{wallet_address}/transaction-hash")
def update_transaction_hash(onramp_data: OnrampBase):
    conn = database.get_db_connection()
    cur = conn.cursor()
    off_ramp_wallet_address = onramp_data.wallet_address.lower()
    transaction_hash = onramp_data.transaction_hash
    try:
        sql = "UPDATE openonramps SET transaction_hash = %s WHERE wallet_address = %s;"
        params = (transaction_hash, off_ramp_wallet_address)

        cur.execute(sql, params)
        conn.commit()  # Only commit if no exceptions occurred

        logging.info("Transaction hash updated successfully.")
        return {"message": "Transaction hash updated successfully"}

    except Exception as e:
        conn.rollback()  # Rollback in case of any error
        logging.error(f"Error updating transaction hash: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    finally:
        cur.close()
        conn.close()


@app.get("/wallets/")
def get_wallet_addresses():
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT wallet_address FROM openonramps;")
        wallet_addresses = cur.fetchall()
        return {
            "wallet_addresses": (
                [address[0] for address in wallet_addresses] if wallet_addresses else []
            )
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    finally:
        cur.close()
        conn.close()


@app.delete("/wallets/{wallet_address}")
def delete_wallet_address(wallet_address: str):
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM openonramps WHERE wallet_address = %s RETURNING id;",
            (wallet_address,),
        )
        deleted = cur.fetchone()
        if deleted is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet address not found.",
            )
        conn.commit()
        return {"message": "Wallet address removed successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    finally:
        cur.close()
        conn.close()

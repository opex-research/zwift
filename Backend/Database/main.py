from fastapi import FastAPI, Depends, HTTPException, status
import database
from schemas import TransactionBase
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# For development, you might allow all origins. Be more restrictive for production.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/transactions/{wallet_address}/registrationstatus")
def get_register_status(wallet_address: str):
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
        if transactions[0]['transaction_status'] == "success":
            return {"registration_status": "registered"}
        elif transactions[0]['transaction_status'] == "pending":
            return {"registration_status": "pending"}
        else:
            return {"registration_status": "not_registered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


#Helper function to simulate an update from the blcokcchain
@app.put("/transactions/{wallet_address}/update_registration_status")
def update_register_status(wallet_address: str):
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
       
        cur.execute(
            "SELECT id FROM transactions WHERE wallet_address = %s AND transaction_type = 'register' AND transaction_status = 'pending'",
            (wallet_address,)
        )
        transaction = cur.fetchone()
        
        # Step 2: If a pending registration transaction exists, update it to 'success'
        if transaction:
            cur.execute(
                "UPDATE transactions SET transaction_status = 'success' WHERE id = %s",
                (transaction['id'],)  # Assuming you're using RealDictCursor or similar
            )
            conn.commit()  # Don't forget to commit the transaction to make the update permanent
            return {"message": "Registration status updated to success."}
        else:
            raise HTTPException(status_code=404, detail="No pending registration transactions found for this wallet address.")

    except Exception as e:
        conn.rollback()  # Roll back in case of any error
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.get("/transactions/{wallet_address}/pending")
def get_pending_transactions(wallet_address: str):
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

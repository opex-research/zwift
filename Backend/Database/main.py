from fastapi import FastAPI, Depends, HTTPException, status
import database
from schemas import TransactionBase
app = FastAPI()


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


###########################################################
#Implement function to fetch all statuses from the pending transactions and update them if the status changed in the blockchain
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
        conn.commit()
        return TransactionBase(
            wallet_address=new_transaction[1],
            transaction_hash=new_transaction[2],
            transaction_type=new_transaction[3],
            transaction_status=new_transaction[4],
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    finally:
        cur.close()
        conn.close()

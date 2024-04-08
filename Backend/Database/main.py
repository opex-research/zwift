from fastapi import FastAPI, Depends
import schemas, database

app = FastAPI()


@app.post("/users/")
def create_user(user: schemas.UserBase):
    conn = database.get_db_connection()
    cur = conn.cursor()
    # Insert user logic here
    cur.close()
    conn.close()
    return {"username": user.username, "email": user.email}


@app.post("/transactions/")
def create_transaction(transaction: schemas.TransactionBase):
    conn = database.get_db_connection()
    cur = conn.cursor()
    # Insert transaction logic here
    cur.close()
    conn.close()
    return {
        "transaction_hash": transaction.transaction_hash,
        "transaction_type": transaction.transaction_type,
    }


# Inside main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


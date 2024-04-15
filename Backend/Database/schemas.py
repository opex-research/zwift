from pydantic import BaseModel



class TransactionBase(BaseModel):
    wallet_address: str
    transaction_hash: str
    transaction_type: str
    transaction_status: str

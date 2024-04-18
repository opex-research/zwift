from pydantic import BaseModel


## base model for transaction databse
class TransactionBase(BaseModel):
    wallet_address: str
    transaction_hash: str
    transaction_type: str
    transaction_status: str


## base model for an incoming onramp request
class OnrampBase(BaseModel):
    wallet_address: str

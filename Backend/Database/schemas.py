from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    email: str


class TransactionBase(BaseModel):
    transaction_hash: str
    transaction_type: str
    transaction_status: str

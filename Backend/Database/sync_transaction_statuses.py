# https://docs.zksync.io/build/api.html#zks-gettransactiondetails

import requests


def fetch_newest_zksync_transaction_status(transaction_ids):
    """Retrieves all current transaction statuses from blockchain for the given array of transaction_ids

    Args:
        transaction_ids (string[]): string array with transaction_ids as elements

    Returns:
        dict: Key=transaction_id; value=transaction_status
    """
    # url mainnet: https://mainnet.era.zksync.io
    url = "https://sepolia.era.zksync.dev"
    headers = {"Content-Type": "application/json"}
    statuses = {}

    for tx_id in transaction_ids:
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "zks_getTransactionDetails",
            "params": [tx_id],
        }
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            status = data.get("result", {}).get("status", "Unknown").lower()
            if status == "pending" or status == "included":
                status = "pending"
            elif status == "verified":
                status = "success"
            else:
                status = "failed"
            statuses[tx_id] = status
        else:
            statuses[tx_id] = "Error in API call"

    return statuses


# Example usage:
transaction_ids = ["0xbfeedbbdf86f396ecfec65b61465749997626f8dcced491b9ad09b4909d31966"]
status_dict = fetch_newest_zksync_transaction_status(transaction_ids)
print(status_dict)
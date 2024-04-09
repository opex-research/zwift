async function postTransaction(
  walletAddress,
  transactionHash,
  transactionType,
  transactionStatus
) {
  const transactionData = {
    wallet_address: walletAddress,
    transaction_hash: transactionHash,
    transaction_type: transactionType,
    transaction_status: transactionStatus,
  };

  try {
    const response = await fetch("http://localhost:8000/transactions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Transaction posted:", data);
    return data;
  } catch (error) {
    console.error("Error posting transaction:", error);
  }
}

async function getPendingTransactions(walletAddress) {
  try {
    const response = await fetch(
      `http://localhost:8000/transactions/${walletAddress}/pending`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Pending transactions:", data);
    return data;
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
  }
}


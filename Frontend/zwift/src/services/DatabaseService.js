export const postTransactionToDatabase = async (
  walletAddress,
  transactionHash,
  transactionType,
  transactionStatus
) => {
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
};

export const getPendingTransactionsFromDatabase = async (walletAddress) => {
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
};


export const getOfframpAddressesInUse = async () => {
  try {
    const response = await fetch(
      `http://localhost:8000/wallets/`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Wallet addresses already used", data);
    return data;
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
  }
};


export const getUsersPendingOffRampIntentsFromDatabase = async (
  walletAddress
) => {
  try {
    const response = await fetch(
      `http://localhost:8000/transactions/${walletAddress}/pending_offramps`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const count = data["pending_transactions"].length;
    return count;
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
  }
};

export const getRegistrationStatusFromDatabase = async (walletAddress) => {
  try {
    const response = await fetch(
      `http://localhost:8000/transactions/${walletAddress}/registration_status`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Received registration status:", data);
    return data["registration_status"];
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
  }
};

//this calls the function in the backend to update the transaction to success, this function is just for testing
export const simulateRegistrationChangeToSuccess = async (walletAddress) => {
  try {
    const response = await fetch(
      `http://localhost:8000/transactions/${walletAddress}/update_registration_status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("received message from success simulation:", data["message"]);
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
  }
};

//this calls the function in the backend to update the transaction to success, this function is just for testing
export const simulateAllPendingTransactionsToSuccess = async (
  walletAddress
) => {
  try {
    const response = await fetch(
      `http://localhost:8000/transactions/${walletAddress}/update_all_transactions`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("received message from success simulation:", data["message"]);
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
  }
};

export const deleteInUseOfframpWalletAddressFromDatabase = async (walletAddress) => {
  try {
    const response = await fetch(`http://localhost:8000/wallets/${walletAddress}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Wallet address deleted:", data);
    return data;
  } catch (error) {
    console.error("Error deleting wallet address:", error);
  }
};


export const addInUseOfframpWalletAddressToDatabase = async (walletAddress) => {
  try {
    const response = await fetch("http://localhost:8000/wallets/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet_address: walletAddress })
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Wallet address added:", data);
    return data;
  } catch (error) {
    console.error("Error adding wallet address:", error);
  }
};

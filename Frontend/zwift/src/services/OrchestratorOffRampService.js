import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import { ethers } from "ethers";
const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";

// function to create an OffRamp Intent
export const newOffRampIntent = async (user, amountInEther) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );

  // Convert amount from Ether to Wei
  const amountInWei = ethers.utils.parseEther(amountInEther.toString());

  try {
    // Ensure to call 'createOffRampIntentAndSendETH' and pass the amount as value
    const transactionResponse =
      await orchestratorContract.createOffRampIntentAndSendETH(
        user,
        amountInWei, // This assumes your function expects the amount in wei
        { value: amountInWei } // Sending ETH along with the transaction
      );
    const receipt = await transactionResponse.wait();
    if (receipt.status !== 1) {
      throw new Error("Transaction failed.");
    }
    return true;
  } catch (error) {
    console.error("Error creating new OffRamp Intent", error);

    // Default error message
    let errorMessage =
      "An error occurred during the off-ramp process: Already an open OffRamp Intent.";

    // Check for error.reason provided by ethers for high-level error info
    if (error.reason) {
      errorMessage = error.reason;
    }

    // Detailed error information often resides within error.data or error.error.data
    if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (
      error.error &&
      error.error.data &&
      typeof error.error.data.message === "string"
    ) {
      errorMessage = error.error.data.message;
    }

    // If the error contains a revert reason within data.message
    const revertReasonMatch = errorMessage.match(/revert: (.*)/);
    if (revertReasonMatch && revertReasonMatch[1]) {
      errorMessage = revertReasonMatch[1];
    }

    throw new Error(errorMessage);
  }
};

// function to decrease an OffRamp Intent after a transaction
export const decreaseOffRampIntentAfterTransaction = async (wallet, amount) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );

  try {
    const transactionResponse =
      await orchestratorContract.decreaseOffRampIntentAfterTransaction(
        wallet,
        amount
      );
    const receipt = await transactionResponse.wait(); // Wait for the transaction to be mined
    return receipt.status === 1; // Returns true if transaction was successful, false otherwise
  } catch (error) {
    console.error("Error decreasing OffRamp Intent", error);

    // Default error message
    let errorMessage =
      "An error occurred during the off-ramp process: Error decreasing OffRamp Intent.";

    // Check for error.reason provided by ethers for high-level error info
    if (error.reason) {
      errorMessage = error.reason;
    }

    // Detailed error information often resides within error.data or error.error.data
    if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (
      error.error &&
      error.error.data &&
      typeof error.error.data.message === "string"
    ) {
      errorMessage = error.error.data.message;
    }

    // If the error contains a revert reason within data.message
    const revertReasonMatch = errorMessage.match(/revert: (.*)/);
    if (revertReasonMatch && revertReasonMatch[1]) {
      errorMessage = revertReasonMatch[1];
    }

    throw new Error(errorMessage);
  }
};

// function to retrieve the current open OffRamp Intent for a wallet
export const getUsersOpenOffRampIntents = async (wallet) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    provider
  );

  try {
    console.log("In here");
    const amount = await orchestratorContract.queryEscrowBalance(wallet);
    console.log("users Intent", amount);
    return amount; // Returns the amount of the open OffRamp Intent
  } catch (error) {
    console.error("Error retrieving open OffRamp Intent", error);

    // Default error message
    let errorMessage =
      "An error occurred during the off-ramp process: Error retrieving open OffRamp Intent.";

    // Check for error.reason provided by ethers for high-level error info
    if (error.reason) {
      errorMessage = error.reason;
    }

    // Detailed error information often resides within error.data or error.error.data
    if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (
      error.error &&
      error.error.data &&
      typeof error.error.data.message === "string"
    ) {
      errorMessage = error.error.data.message;
    }

    // If the error contains a revert reason within data.message
    const revertReasonMatch = errorMessage.match(/revert: (.*)/);
    if (revertReasonMatch && revertReasonMatch[1]) {
      errorMessage = revertReasonMatch[1];
    }
    throw new Error(errorMessage);
  }
};

export const getOpenOffRampIntentsFromQueue = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    provider
  );

  try {
    // Await the promise to get the BigNumber
    const bigNumberAmount =
      await orchestratorContract.numberOfOpenOffRampIntents();
    // Use BigNumber methods to convert to a number or string
    const amount = bigNumberAmount.toNumber(); // or .toString() if the number could be large
    console.log("This is the amount", amount);
    return amount; // Returns the number of open OffRamp Intents
  } catch (error) {
    console.error("Error retrieving number of open OffRamp Intents", error);

    // Default error message
    let errorMessage =
      "An error occurred during the off-ramp process: Error retrieving number of open OffRamp Intents.";

    // Check for error.reason provided by ethers for high-level error info
    if (error.reason) {
      errorMessage = error.reason;
    }

    // Detailed error information often resides within error.data or error.error.data
    if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (
      error.error &&
      error.error.data &&
      typeof error.error.data.message === "string"
    ) {
      errorMessage = error.error.data.message;
    }

    // If the error contains a revert reason within data.message
    const revertReasonMatch = errorMessage.match(/revert: (.*)/);
    if (revertReasonMatch && revertReasonMatch[1]) {
      errorMessage = revertReasonMatch[1];
    }
    throw new Error(errorMessage);
  }
};

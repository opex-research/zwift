import { orchestratorABI, orchestratorAddress, provider } from '../contracts/config';
import { ethers, utils } from "ethers";
import { postTransaction, postTransactionToDatabase } from "./DatabaseService";


export const newOffRampIntent = async (wallet, amountInEther) => {
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    orchestratorABI.abi,
    signer
  );

  const amountInWei = utils.parseEther(amountInEther.toString());

  try {
    // Send the transaction without waiting for it to be mined
    const transactionResponse =
      await orchestratorContract.createOffRampIntentAndSendETH(
        wallet,
        amountInWei,
        { value: amountInWei }
      );

    console.log("Transaction submitted:", transactionResponse.hash);
    // Immediately resolve transaction and and post pending state to database
    try {
      const offRampDatabaseReturn = await postTransactionToDatabase(
        wallet,
        transactionResponse.hash,
        "offramp",
        "pending"
      );
    } catch (error){
      console.error("Error posting transaction to database", error);

      // Constructing a more informative error message
      let errorMessage = "An error occurred during the off-ramp process.";
      if (error.reason) errorMessage = error.reason;
      if (error.data?.message) errorMessage = error.data.message;
      else if (error.error?.data?.message)
        errorMessage = error.error.data.message;

      throw new Error(errorMessage);
    }
    return {
      status: "pending",
      transactionHash: transactionResponse.hash,
      user: wallet,
      amount: amountInEther,
    };
  } catch (error) {
    console.error("Error creating new OffRamp Intent", error);

    // Constructing a more informative error message
    let errorMessage = "An error occurred during the off-ramp process.";
    if (error.reason) errorMessage = error.reason;
    if (error.data?.message) errorMessage = error.data.message;
    else if (error.error?.data?.message)
      errorMessage = error.error.data.message;

    const revertReasonMatch = errorMessage.match(/revert: (.*)/);
    if (revertReasonMatch && revertReasonMatch[1])
      errorMessage = revertReasonMatch[1];

    throw new Error(errorMessage);
  }
};

/*
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
*/
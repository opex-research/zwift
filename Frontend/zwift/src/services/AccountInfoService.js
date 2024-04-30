import {
  orchestratorABI,
  orchestratorAddress,
  provider,
} from "../contracts/config";
import { ethers } from "ethers";
import { getUsersPendingOffRampIntentsFromDatabase } from "./DatabaseService";

// function to retrieve the current open OffRamp Intent for a wallet
export const getUsersOpenOffRampIntents = async (wallet) => {
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    orchestratorABI.abi,
    provider
  );

  try {
    const amountWei = await orchestratorContract.queryEscrowBalance(wallet);
    const amountEth = ethers.utils.formatEther(amountWei);
    return amountEth; // Returns the amount of the open OffRamp Intent
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
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    orchestratorABI.abi,
    provider
  );

  try {
    // Await the promise to get the BigNumber
    const bigNumberAmount =
      await orchestratorContract.numberOfOpenOffRampIntents();
    // Use BigNumber methods to convert to a number or string
    const amount = bigNumberAmount.toNumber(); // or .toString() if the number could be large
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

export const getAccountBalance = async (account) => {
  if (!account) return null;
  try {
    const balance = await provider.getBalance(account);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Could not detect the Balance", error);
    throw new Error(error.reason || "An error occurred during login.");
  }
};

export const getUserEmail = async (wallet) => {
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    orchestratorABI.abi,
    provider
  );
  try {
    const email = await orchestratorContract.getUserEmail(wallet);
    return email;
  } catch (error) {
    console.log("Error with email:", error);
    throw new Error(error.reason || "An error occurred during login.");
  }
};

export const getUsersPendingOffRampIntents = async (wallet) => {
  try {
    const count = getUsersPendingOffRampIntentsFromDatabase(wallet);
    return count;
  } catch (error) {
    console.log(
      "Error with retrieving pending transactions from database",
      error
    );
    throw new Error(error.reason || "An error occured retrieving user data");
  }
};

export const getAccountInfo = async (wallet) => {
  const returnedBalance = await getAccountBalance(wallet);
  const returnedRegisteredEmail = await getUserEmail(wallet);
  const returnedOpenOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
  const returnedUsersOffRampIntent = await getUsersOpenOffRampIntents(wallet);
  const returnedUsersPendingOffRampIntents =
    await getUsersPendingOffRampIntents(wallet);
  console.log("open off ramps in queue", returnedOpenOffRampsInQueue);
  return {
    returnedBalance, // shorthand for balance: balance
    returnedRegisteredEmail,
    returnedOpenOffRampsInQueue,
    returnedUsersOffRampIntent,
    returnedUsersPendingOffRampIntents,
  };
};

import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import { ethers } from "ethers";
const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";

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
    const amountWei = await orchestratorContract.queryEscrowBalance(wallet);
    const amountEth = ethers.utils.formatEther(amountWei);
    console.log("users Intent", amountEth);
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

export const getAccountBalance = async (account) => {
  if (!account) return null;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    const balance = await provider.getBalance(account);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Could not detect the Balance", error);
    throw new Error(error.reason || "An error occurred during login.");
  }
};

export const getUserEmail = async (wallet) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
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

export const getAccountInfo = async (wallet) => {
  const balance = await getAccountBalance(wallet);
  const registeredEmail = await getUserEmail(wallet);
  const openOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
  const usersOffRampIntents = await getUsersOpenOffRampIntents(wallet);

  return {
    balance, // shorthand for balance: balance
    registeredEmail,
    openOffRampsInQueue,
    usersOffRampIntents,
  };
};

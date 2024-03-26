import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import { ethers } from "ethers";
const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";



export const newOffRampIntent = async (user, amountInEther) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );

  const amountInWei = ethers.utils.parseEther(amountInEther.toString());

  return new Promise((resolve, reject) => {
    orchestratorContract.once("OffRampIntentCreatedAndETHSent", (user, amount) => {
      // Event listener callback
      console.log(`Off-ramp intent created for user: ${user} with amount: ${ethers.utils.formatEther(amount)}`);
      resolve({ user, amount: ethers.utils.formatEther(amount) });
    });

    orchestratorContract.createOffRampIntentAndSendETH(user, amountInWei, { value: amountInWei })
      .then((transactionResponse) => transactionResponse.wait())
      .then((receipt) => {
        if (receipt.status !== 1) {
          throw new Error("Transaction failed.");
        }
        // If the event doesn't get emitted, resolve or reject after a timeout
        setTimeout(() => reject(new Error("Timeout waiting for event")), 60000); // 60 seconds timeout
      })
      .catch((error) => {
        console.error("Error creating new OffRamp Intent", error);

        let errorMessage = "An error occurred during the off-ramp process.";
        if (error.reason) errorMessage = error.reason;
        if (error.data?.message) errorMessage = error.data.message;
        else if (error.error?.data?.message) errorMessage = error.error.data.message;

        const revertReasonMatch = errorMessage.match(/revert: (.*)/);
        if (revertReasonMatch && revertReasonMatch[1]) errorMessage = revertReasonMatch[1];

        reject(new Error(errorMessage));
      });
  });
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

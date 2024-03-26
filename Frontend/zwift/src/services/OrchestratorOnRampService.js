import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import { ethers } from "ethers";
const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";

export const getPeerForOnRamp = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );

  try {
    const peerAddress =
      await orchestratorContract.getAndRemoveOffRampersIntentFromQueue();
    const receipt = await transactionResponse.wait();
    if (receipt.status !== 1) {
      throw new Error("Transaction failed.");
    }
    try {
      const peerEmail = await orchestratorContract.getUserEmail(peerAddress);
      const receipt = await transactionResponse.wait();
      if (receipt.status !== 1) {
        throw new Error("Transaction failed.");
      }
      return peerAddress, peerEmail;
    } catch (error) {
      console.error("Error finding Email", error);
    }
  } catch (error) {
    console.error("Error finding Peer", error);

    // Default error message
    let errorMessage = "An error occurred during the peer-finding process ...";

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

export const onRamp = async (
  amount,
  offRamper,
  transactionSenderEmail,
  transactionReceiverEmail,
  transactionAmount
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );
  try {
    await orchestratorContract.onRamp(
      amount,
      offRamper,
      transactionSenderEmail,
      transactionReceiverEmail,
      transactionAmount
    );
    const receipt = await transactionResponse.wait();
    if (receipt.status !== 1) {
      throw new Error("Transaction failed.");
    }
    return true;
  } catch (error) {
    console.error("Error performing onRamp", error);

    // Default error message
    let errorMessage = "An error occurred during the onRamping process ...";

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

import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import MetaMaskOnboarding from "@metamask/onboarding";
import { ethers } from "ethers";
import {
  postTransactionToDatabase,
  updateTransactionStatusForAccount,
} from "../services/DatabaseService";
import { useAccount } from "../context/AccountContext";
const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";
const forwarderOrigin = "http://localhost:3000";
const onboarding = new MetaMaskOnboarding({ forwarderOrigin });
const isLocal = process.env.IS_LOCAL;

export const loginWithMetaMask = async () => {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    console.log("Need to install MetaMask");
    onboarding.startOnboarding();
    throw new Error(
      "Need to install MetaMask" || "An error occurred during login."
    );
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error) {
    console.error("Could not detect Account", error);
    throw new Error(error.reason || "An error occurred during login.");
  }
};

export const registerUserAccount = async (email) => {
  const wallet = await loginWithMetaMask();
  if (!wallet) {
    console.log("Error during registration");
    throw new Error(
      "Error during registration" || "An error occurred during login."
    );
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );
  try {
    const transactionResponse = await orchestratorContract.registerUserAccount(
      wallet,
      email
    );
    console.log(
      "Registration request submitted, transaction hash:",
      transactionResponse.hash
    );
    const registrationReturn = await postTransactionToDatabase(
      wallet,
      transactionResponse.hash,
      "register",
      "pending"
    );
    return {
      wallet,
      status: "pending",
      transactionHash: transactionResponse.hash,
    };
  } catch (error) {
    console.error("Error during registration", error);

    // Default error message
    let errorMessage =
      "An error occurred during registration: Possible blockchain inconsistency, restart/clear wallet.";

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

export const loginUserAccount = async () => {
  const wallet = await loginWithMetaMask();
  if (!wallet) return null;
  console.log(wallet);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );
  try {
    const isSuccess = await orchestratorContract.loginUserAccount(wallet);
    if (isLocal != "TRUE"){
    if (isSuccess) {
      try {
        updateTransactionStatusForAccount(wallet);
      } catch (error) {
        console.log("Error with updating the transaction statuses", error);
      }
    }
  }
    return isSuccess ? wallet : null;
  } catch (error) {
    console.log("Error with login:", error);
    throw new Error(error.reason || "An error occurred during login.");
  }
};

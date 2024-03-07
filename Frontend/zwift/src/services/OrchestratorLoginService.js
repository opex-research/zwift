import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import MetaMaskOnboarding from "@metamask/onboarding";
import { ethers } from "ethers";

const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";
const forwarderOrigin = "http://localhost:3000";
const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

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
    const receipt = await transactionResponse.wait(); // Wait for the transaction to be mined
    if (receipt.status === 1) {
      console.log("Registration successful");
      return wallet; // Indicate success
    } else {
      console.error("Transaction failed");
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Error with registration:", error);
    throw new Error("You are already registered");
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
    return isSuccess ? wallet : null;
  } catch (error) {
    console.log("Error with login:", error);
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

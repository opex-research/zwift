import { ethers } from 'ethers';
import OrchestratorABI from './path/to/OrchestratorABI.json'; // Correct the path as needed
import MetaMaskOnboarding from "@metamask/onboarding";

const orchestratorAddress = 'YOUR_ORCHESTRATOR_CONTRACT_ADDRESS';
const forwarderOrigin = "http://localhost:3000";
const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

export const loginWithMetaMask = async () => {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    console.log("Need to install MetaMask");
    onboarding.startOnboarding();
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
  } catch (error) {
    console.error("Could not detect Account", error);
    return null;
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
    return null;
  }
};

export const registerUserAccount = async (email) => {
    const wallet = await loginWithMetaMask();
    if (!wallet) {
        console.log("Error during registration");
        return null;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const orchestratorContract = new ethers.Contract(orchestratorAddress, OrchestratorABI, signer);
    
    const transaction = await orchestratorContract.registerUserAccount(wallet, email);
    await transaction.wait(); // Wait for the transaction to be mined
    return wallet;
};

export const loginUserAccount = async () => {
    const wallet = await loginWithMetaMask();
    if (!wallet) return null;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const orchestratorContract = new ethers.Contract(orchestratorAddress, OrchestratorABI, signer);
    
    const isSuccess = await orchestratorContract.loginUserAccount(wallet);
    return isSuccess ? wallet : null;
};

export const getUserEmail = async (wallet) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const orchestratorContract = new ethers.Contract(orchestratorAddress, OrchestratorABI, provider);
    
    const email = await orchestratorContract.getUserEmail(wallet);
    return email;
};

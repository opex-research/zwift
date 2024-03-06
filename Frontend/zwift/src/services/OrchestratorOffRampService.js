import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import { ethers } from "ethers";
const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";


// function to create an OffRamp Intent
export const newOffRampIntent = async (wallet, amount) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(orchestratorAddress, OrchestratorABI.abi, signer);

  try {
    const transactionResponse = await orchestratorContract.newOffRampIntent(wallet, amount);
    const receipt = await transactionResponse.wait(); // Wait for the transaction to be mined
    return receipt.status === 1; // Returns true if transaction was successful, false otherwise
  } catch (error) {
    console.error("Error creating new OffRamp Intent", error);
    return false; // Indicate failure
  }
};

// function to decrease an OffRamp Intent after a transaction
export const decreaseOffRampIntentAfterTransaction = async (wallet, amount) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(orchestratorAddress, OrchestratorABI.abi, signer);

  try {
    const transactionResponse = await orchestratorContract.decreaseOffRampIntentAfterTransaction(wallet, amount);
    const receipt = await transactionResponse.wait(); // Wait for the transaction to be mined
    return receipt.status === 1; // Returns true if transaction was successful, false otherwise
  } catch (error) {
    console.error("Error decreasing OffRamp Intent", error);
    return false; // Indicate failure
  }
};

// function to retrieve the current open OffRamp Intent for a wallet
export const getOpenOffRampIntent = async (wallet) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const orchestratorContract = new ethers.Contract(orchestratorAddress, OrchestratorABI.abi, provider);

  try {
    const amount = await orchestratorContract.getOpenOffRampIntent(wallet);
    return amount; // Returns the amount of the open OffRamp Intent
  } catch (error) {
    console.error("Error retrieving open OffRamp Intent", error);
    return 0; // Indicates failure or no intent
  }
};
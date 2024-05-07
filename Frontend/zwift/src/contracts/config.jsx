// Import the ABI definitions from JSON files
import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import OrchestratorABIZksync from "../contracts/Orchestrator_zksync.json";
import { Provider } from "zksync-ethers";
import { ethers } from "ethers"; // Ensure this import is placed correctly and is available in your project

// Define the contract addresses
const orchestratorAddressAnvil = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";
const orchestratorAddressZksync = "0x6f74F759715DFA0f323af0e2326E787D599FD42a";

// Check the environment variable
console.log(process.env.REACT_APP_IS_LOCAL);
const isLocal = process.env.REACT_APP_IS_LOCAL === "TRUE";
console.log(isLocal);
// Determine which settings to use based on the environment
const orchestratorABI = isLocal
  ? OrchestratorABI
  : OrchestratorABIZksync.contracts["src/Orchestrator.sol"].Orchestrator;
const orchestratorAddress = isLocal
  ? orchestratorAddressAnvil
  : orchestratorAddressZksync;

// Select the appropriate provider based on the environment
const provider = isLocal
  ? new ethers.providers.Web3Provider(window.ethereum)
  : new Provider("https://sepolia.era.zksync.dev");

export const getSigner = async () => {
  const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
  await tempProvider.send("eth_requestAccounts", []); // Ensures the user has connected their wallet
  return tempProvider.getSigner();
};

// Export the determined settings
export { orchestratorABI, orchestratorAddress, provider };

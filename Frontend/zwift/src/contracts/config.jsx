// Import the ABI definitions from JSON files
import OrchestratorABI from "../contracts/Orchestrator.json"; // Correct the path as needed
import OrchestratorABIZksync from "../contracts/Orchestrator_zksync.json";
import { Provider } from "zksync-ethers/lib/provider";
import { providers } from "ethers/providers";
// Define the contract addresses
const orchestratorAddressAnvil = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";
const orchestratorAddressZksync = "0x6f74F759715DFA0f323af0e2326E787D599FD42a";

// Check the environment variable
const isLocal = process.env.IS_LOCAL === "TRUE";

// Determine which settings to use based on the environment
const orchestratorABI = isLocal
  ? OrchestratorABI
  : OrchestratorABIZksync.contracts["src/Orchestrator.sol"].Orchestrator;
const orchestratorAddress = isLocal
  ? orchestratorAddressAnvil
  : orchestratorAddressZksync;
const provider = isLocal
  ? new providers.Web3Provider(window.ethereum)
  : new Provider("https://sepolia.era.zksync.dev");

// Export the determined settings
export { orchestratorABI, orchestratorAddress, provider };
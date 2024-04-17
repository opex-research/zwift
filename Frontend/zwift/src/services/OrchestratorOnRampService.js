import OrchestratorABI from "../contracts/Orchestrator.json";
import { ethers } from "ethers";
import { getOfframpAddressesInUse } from "./DatabaseService";
const orchestratorAddress = "0x95bD8D42f30351685e96C62EDdc0d0613bf9a87A";

// Function to validate and convert addresses
function validateAndConvertAddresses(addresses) {
  // Ensure addresses is always treated as an array
  if (!Array.isArray(addresses)) {
    return []; // Return an empty array if the input is not an array
  }

  // Map and filter addresses
  return addresses
    .map((address) => {
      try {
        // This will throw an error if the address is not valid
        return ethers.utils.getAddress(address);
      } catch (error) {
        console.error(`${address} is not a valid Ethereum address:`, error);
        return null; // Return null for invalid addresses, to be filtered out
      }
    })
    .filter(Boolean); // Removes any null entries if invalid addresses were found
}

export const getPeerForOnRamp = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    OrchestratorABI.abi,
    signer
  );
  try {
    const walletAddressesAlreadyUsedForOnramp =
      await getOfframpAddressesInUse();
    console.log("Address return", walletAddressesAlreadyUsedForOnramp);
    const validatedWalletAddressesAlreadyUsedForOnramp =
      validateAndConvertAddresses(walletAddressesAlreadyUsedForOnramp);
    console.log(validatedWalletAddressesAlreadyUsedForOnramp);

    const [offRampAddress, offRampEmail] =
      await orchestratorContract.getLongestQueuingOffRampIntentAddress(
        validatedWalletAddressesAlreadyUsedForOnramp
      );
    console.log(
      "The addresses from the smart contract",
      offRampAddress,
      offRampEmail
    );
    //const peerEmail = await orchestratorContract.getLongestQueuingOffRampIntentAddress(peerAddress);
    //console.log({ peerAddress, peerEmail }); // Do something with peerAddress and peerEmail
    return { offRampAddress, offRampEmail };
  } catch (error) {
    console.error("Error finding Email", error);
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
      ethers.utils.parseUnits(amount.toString(), "ether"),
      offRamper,
      transactionSenderEmail,
      transactionReceiverEmail,
      ethers.utils.parseUnits(transactionAmount.toString(), "ether")
    );
  } catch (error) {
    console.error("Error performing onRamp", error);
  }
};
/*
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

  return new Promise((resolve, reject) => {
    // Listen for success event
    const successFilter =
      orchestratorContract.filters.OnRampCompletedInOrchestrator(
        offRamper,
        null,
        null
      );
    orchestratorContract.once(successFilter, (offRamper, onRamper, amount) => {
      console.log(
        `OnRamp successful for ${offRamper} with amount ${ethers.utils.formatEther(
          amount
        )}`
      );
      resolve({
        success: true,
        offRamper,
        onRamper,
        amount: ethers.utils.formatEther(amount),
      });
    });

    // Listen for failure event
    const failureFilter =
      orchestratorContract.filters.OnRampFailedInOrchestrator(
        offRamper,
        null,
        null
      );
    orchestratorContract.once(failureFilter, (offRamper, onRamper, amount) => {
      console.error(
        `OnRamp failed for ${offRamper} with amount ${ethers.utils.formatEther(
          amount
        )}`
      );
      reject(new Error(`OnRamp failed for ${offRamper}`));
    });

    // Send the transaction
    orchestratorContract
      .onRamp(
        ethers.utils.parseUnits(amount.toString(), "ether"),
        offRamper,
        transactionSenderEmail,
        transactionReceiverEmail,
        ethers.utils.parseUnits(transactionAmount.toString(), "ether")
      )
      .then((onRampTransaction) => onRampTransaction.wait())
      .then((receipt) => {
        if (receipt.status !== 1) {
          throw new Error("Transaction failed.");
        }
        // The promise is resolved or rejected by the event listeners.
      })
      .catch((error) => {
        console.error("Error performing onRamp", error);
        reject(error); // Reject the promise if there's an issue with the transaction
      });
  });
};
*/

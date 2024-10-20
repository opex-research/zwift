import {
  orchestratorABI,
  orchestratorAddress,
  provider,
  getSigner,
} from "../contracts/config";
import { ethers, utils } from "ethers";
import {
  addInUseOfframpWalletAddressToDatabase,
  getOfframpAddressesInUse,
  postTransactionToDatabase,
  updateTransactionHashForInUseOnRampWalletAddress,
} from "./DatabaseService";

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
        return utils.getAddress(address);
      } catch (error) {
        console.error(`${address} is not a valid Ethereum address:`, error);
        return null; // Return null for invalid addresses, to be filtered out
      }
    })
    .filter(Boolean); // Removes any null entries if invalid addresses were found
}

export const getPeerForOnRamp = async () => {
  const signer = await getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    orchestratorABI.abi,
    signer
  );
  try {
    const walletAddressesAlreadyUsedForOnramp =
      await getOfframpAddressesInUse();
    const validatedWalletAddressesAlreadyUsedForOnramp =
      validateAndConvertAddresses(walletAddressesAlreadyUsedForOnramp);
    const [offRampAddress, offRampEmail] =
      await orchestratorContract.getLongestQueuingOffRampIntentAddress(
        validatedWalletAddressesAlreadyUsedForOnramp
      );
    console.log(offRampAddress, offRampEmail);
    if (offRampAddress != null) {
      try {
        await addInUseOfframpWalletAddressToDatabase(offRampAddress);
        console.log("Added ", offRampAddress, " to databse for open onramps");
      } catch (err) {
        console.log("Error adding offramp address to pendingOnRampQueue", err);
      }
    }

    //const peerEmail = await orchestratorContract.getLongestQueuingOffRampIntentAddress(peerAddress);
    //console.log({ peerAddress, peerEmail }); // Do something with peerAddress and peerEmail
    return { peerAddress: offRampAddress, peerEmail: offRampEmail };
  } catch (error) {
    console.error("Error finding Email", error);
  }
};

export const onRamp = async (
  amount,
  offRamper,
  transactionSenderEmail,
  transactionReceiverEmail,
  transactionAmount,
  onRamperAccount,
  signature,
  timestamp
) => {
  const signer = await getSigner();
  const orchestratorContract = new ethers.Contract(
    orchestratorAddress,
    orchestratorABI.abi,
    signer
  );
  try {
    const parsedAmount = utils.parseUnits(amount.toString(), "ether");
    const parsedTransactionAmount = utils.parseUnits(
      transactionAmount.toString(),
      "ether"
    );
    console.log("Transaction onRamp data that is send in onRamp:");
    console.log("Amount:", parsedAmount);
    console.log("TransactionAmount:", parsedTransactionAmount);
    console.log("OffRamper:", offRamper);
    console.log("TransactionSencer:", transactionSenderEmail);
    console.log("TransactinoReceiver:", transactionReceiverEmail);
    console.log("Signature:", signature);
    console.log("Timestamp:", timestamp);
    const txResponse = await orchestratorContract.onRamp(
      parsedAmount,
      offRamper,
      transactionSenderEmail,
      transactionReceiverEmail,
      parsedTransactionAmount,
      signature, // pass the signature to the smart contract
      timestamp // pass the timestamp to the smart contract
    );
    const transactionHash = txResponse.hash;
    try {
      const transaction_post = await postTransactionToDatabase(
        onRamperAccount,
        transactionHash,
        "onramp",
        "pending"
      );
      console.log(transaction_post);
      try {
        const update_response =
          await updateTransactionHashForInUseOnRampWalletAddress(
            offRamper,
            transactionHash
          );
        console.log(update_response);
      } catch (error) {
        console.log("Error updating transaction hash for in OnRampUse", error);
      }
    } catch (error) {
      console.error("Error performing onRamp", error);
    }
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

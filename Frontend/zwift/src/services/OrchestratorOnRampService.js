import OrchestratorABI from "../contracts/Orchestrator.json";
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
  
    // Function to handle the event and retrieve peer email
    const handlePeerAddress = async (peerAddress) => {
      try {
        const peerEmail = await orchestratorContract.getUserEmail(peerAddress);
        console.log({ peerAddress, peerEmail }); // Do something with peerAddress and peerEmail
        return { peerAddress, peerEmail };
      } catch (error) {
        console.error("Error finding Email", error);
      }
    };
  
    return new Promise((resolve, reject) => {
      // Listen for the event once
      orchestratorContract.once("GotOffRampersAddressInOrchestrator", async (peerAddress) => {
        try {
          // Once the event is received, handle the peer address
          const result = await handlePeerAddress(peerAddress);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
  
      // Send the transaction
      orchestratorContract.getAndRemoveOffRampersIntentFromQueue()
        .then((queueTransaction) => queueTransaction.wait())
        .then((receipt) => {
          if (receipt.status !== 1) {
            throw new Error("Transaction failed.");
          }
        })
        .catch((error) => {
          console.error("Error finding Peer or processing transaction", error);
          reject(error); // Reject the promise if there's an issue with the transaction
        });
    });
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
    // Assuming this initiates a state-changing transaction
    const onRampTransaction = await orchestratorContract.onRamp(
      amount,
      offRamper,
      transactionSenderEmail,
      transactionReceiverEmail,
      transactionAmount
    );
    const receipt = await onRampTransaction.wait();
    if (receipt.status !== 1) {
      throw new Error("Transaction failed.");
    }
    return true;
  } catch (error) {
    console.error("Error performing onRamp", error);
    throw error; // Re-throw the error after logging
  }
};

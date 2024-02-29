import { ethers } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";

const forwarderOrigin = "http://localhost:3000";
const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

export const loginWithMetaMask = async () => {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    console.log("Need to install MetaMask");
    onboarding.startOnboarding();
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error) {
    console.error("Could not detect Account", error);
    return null;
  }
};

export const getAccountBalance = async (account) => {
  if (!account) return null;

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Could not detect the Balance", error);
    return null;
  }
};

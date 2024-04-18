import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Importing login service functions
import {
  loginUserAccount,
  registerUserAccount,
  getAccountBalance,
  getUserEmail,
} from "../services/OrchestratorLoginService";

import { getAccountInfo } from "../services/AccountInfoService";

const AccountContext = createContext();

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
  const [logged, setLogged] = useState(false);
  const [metaMaskLogged, setMetaMaskLogged] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState();
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [usersOffRampIntent, setUsersOffRampIntent] = useState(0);
  const [usersPendingOffRampIntents, setUsersPendingOffRampIntents] =
    useState(0);
  const [openOffRampsInQueue, setOpenOffRampsInQueue] = useState(0);
  const [paypalEmail, setPaypalEmail] = useState("");
  

  const fetchUserData = async (account) => {
    try {
      const {
        returnedBalance,
        returnedRegisteredEmail,
        returnedOpenOffRampsInQueue,
        returnedUsersOffRampIntent,
        returnedUsersPendingOffRampIntents,
      } = await getAccountInfo(account); // Assuming getAccountInfo is adjusted to return an object
      if (returnedBalance) setBalance(returnedBalance);
      if (returnedRegisteredEmail) setRegisteredEmail(returnedRegisteredEmail);
      if (returnedOpenOffRampsInQueue)
        setOpenOffRampsInQueue(returnedOpenOffRampsInQueue);
      if (returnedUsersOffRampIntent)
        setUsersOffRampIntent(returnedUsersOffRampIntent);
      if (returnedUsersPendingOffRampIntents)
        setUsersPendingOffRampIntents(returnedUsersPendingOffRampIntents);
    } catch (error) {
      console.log("Error fetching user data", error);
    }
  };

  const checkSessionAndFetchUserData = async () => {
    setLoading(true); // Ensure loading is true at the start
    try {
      const response = await axios.get(
        `http://127.0.0.1:3001/api/auth/checksession`,
        { withCredentials: true }
      );
      if (response.data === "Session alive") {
        setLogged(true);
        const account = await loginUserAccount(); // Ensure this function does not require user input
        if (account) {
          setAccount(account);
          await fetchUserData(account); // Fetch and set additional user data
        }
      } else {
        setLogged(false);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setLogged(false);
    } finally {
      setLoading(false); // This ensures loading is set to false after operations complete
    }
  };

  useEffect(() => {
    checkSessionAndFetchUserData();
  }, []);

  return (
    <AccountContext.Provider
      value={{
        logged,
        loading,
        account,
        setAccount,
        balance,
        setBalance,
        logged,
        setLogged,
        metaMaskLogged,
        setMetaMaskLogged,
        registeredEmail,
        setRegisteredEmail,
        usersOffRampIntent,
        setUsersOffRampIntent,
        openOffRampsInQueue,
        setOpenOffRampsInQueue,
        paypalEmail,
        setPaypalEmail,
        usersPendingOffRampIntents,
        setUsersPendingOffRampIntents,
        checkSessionAndFetchUserData,
    
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

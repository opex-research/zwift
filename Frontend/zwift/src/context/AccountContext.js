import React, { createContext, useContext, useState } from "react";

const AccountContext = createContext();

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
  const [logged, setLogged] = useState(false);
  const [metaMaskLogged, setMetaMaskLogged] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState();
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [usersOffRampIntent, setUsersOffRampIntent] = useState(0);
  const [openOffRampsInQueue, setOpenOffRampsInQueue] = useState(0);
  const [paypalEmail, setPaypalEmail] = useState("");
  
  return (
    <AccountContext.Provider
      value={{
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
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

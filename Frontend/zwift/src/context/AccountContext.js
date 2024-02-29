import React, { createContext, useContext, useState } from "react";

const AccountContext = createContext();

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
  const [logged, setLogged] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState();

  return (
    <AccountContext.Provider
      value={{ account, setAccount, balance, setBalance, logged, setLogged }}
    >
      {children}
    </AccountContext.Provider>
  );
};

import React, { createContext, useContext, useState } from "react";

const AccountContext = createContext();

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
  const [logged, setLogged] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState();
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [usersOffRampIntent, setUsersOffRampIntent] = useState(0)

  return (
    <AccountContext.Provider
      value={{ account, setAccount, balance, setBalance, logged, setLogged, registeredEmail, setRegisteredEmail, usersOffRampIntent, setUsersOffRampIntent}}
    >
      {children}
    </AccountContext.Provider>
  );
};

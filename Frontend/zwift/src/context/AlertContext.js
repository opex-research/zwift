import React, { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ message: "", type: "" });

  const showAlert = useCallback((message, type = "error") => {
    setAlert({ message, type });
    // Auto-dismiss or add a method to manually dismiss the alert
  }, []);

  return (
    <AlertContext.Provider value={{ alert, showAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

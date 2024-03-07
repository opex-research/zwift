import { useState, useCallback } from "react";

const useErrorHandler = (initialState = "") => {
  const [error, setError] = useState(initialState);

  const showError = useCallback((message) => {
    setError(message);
    // Additionally, you could integrate an error logging service here
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return { error, showError, clearError };
};

export default useErrorHandler;

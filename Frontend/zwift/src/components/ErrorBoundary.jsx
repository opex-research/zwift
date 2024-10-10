import React from "react";
import { ErrorBoundary } from "react-error-boundary";

// FallbackComponent to display when an error occurs
const FallbackComponent = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="error-boundary">
    <h2>Oops! Something went wrong</h2>
    <p>Error details: {error.message}</p>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Error logging service
const errorService = {
  log: (error, errorInfo) => {
    console.error("Caught an error:", error, errorInfo);
    // Here you can add more sophisticated error logging, like sending to a server
  },
};

// Main ErrorBoundary wrapper component
const AppErrorBoundary = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={FallbackComponent}
    onError={(error, errorInfo) => errorService.log(error, errorInfo)}
    onReset={() => {
      // Reset application state here if needed
      // For example: window.location.reload();
    }}
  >
    {children}
  </ErrorBoundary>
);

export default AppErrorBoundary;

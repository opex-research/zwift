import { ErrorBoundary } from "react-error-boundary";

function FallbackComponent({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

const errorService = {
  log: ({ error, errorInfo }) => {
    console.error("Error logged:", error, errorInfo);
  },
};

export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, errorInfo) => errorService.log({ error, errorInfo })}
      onReset={() => {
        // reset the state of your app
      }}
    ></ErrorBoundary>
  );
}

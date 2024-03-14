import React, { useEffect, useState } from "react";

// Add a prop to the function component
const LoadingMessage = ({ message = "LOGGING YOU IN" }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : ""));
    }, 500); // Change dot count every 500 ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {message}
      {dots}
    </div>
  );
};

export default LoadingMessage;

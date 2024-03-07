import React, { useState } from "react";
import { Button, Typography, TextField, Stack } from "@mui/material";
import { useAccount } from "../context/AccountContext";
import { newOffRampIntent } from "../services/OrchestratorOffRampService";

const OffRamp = () => {
  const { account, setUsersOffRampIntent, usersOffRampIntent } = useAccount();
  const [offRampIntentCreated, setOffRampIntentCreated] = useState(false);
  const [amount, setAmount] = useState("100"); // Keep amount as string for TextField compatibility

  const handleOffRampClick = async () => {
    // Convert amount to number (parseInt or similar, depending on your needs)
    const amountNum = parseInt(amount, 10); // Assuming amount is integer; use parseFloat for decimals
    try {
      // Assuming newOffRampIntent is an async function
      const createdOffRamp = await newOffRampIntent(account, amountNum);
      if (createdOffRamp) {
        setOffRampIntentCreated(true);
        const newUsersOpenOffRampIntent =
          parseInt(usersOffRampIntent, 10) + parseInt(amount, 10);
        setUsersOffRampIntent(newUsersOpenOffRampIntent);

        setUsersOffRampIntent(newUsersOpenOffRampIntent);
      } else {
        // Handle the case where creation is not successful
        console.error("Failed to create off-ramp intent.");
        // Potentially set an error state and display it to the user here
      }
    } catch (error) {
      console.error("Error creating off-ramp intent:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleCreateAnother = () => {
    setOffRampIntentCreated(false);
    setAmount("100"); // Reset amount or handle as needed
  };

  if (offRampIntentCreated) {
    return (
      <Stack direction="column" spacing={2} alignItems="center">
        <Typography variant="h6" gutterBottom>
          Successful intent created
        </Typography>
        <Button variant="outlined" onClick={handleCreateAnother}>
          Create another intent
        </Button>
      </Stack>
    );
  }

  return (
    <div>
      <Stack direction="column" spacing={2}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "light" }}>
          Set the amount that you want to OffRamp:
        </Typography>
        <TextField
          type="number"
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)} // Added to allow amount change
          disabled // Disable if intent is created
        />
        <Button variant="outlined" onClick={handleOffRampClick}>
          Create OffRamp Intent
        </Button>
      </Stack>
    </div>
  );
};

export default OffRamp;

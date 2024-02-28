import React from "react";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Button, Stack } from "@mui/material";

const OnRamp = () => {
  // Example emails, replace with actual data source as needed
  const emailAddresses = [
    "email1@example.com",
    "email2@example.com",
    "email3@example.com",
  ];

  return (
    <div>
      <Stack alignItems="center">
        <TextField label="Amount" variant="outlined" type="number" />
        <div>
        <p>Peer found: max.mustermann@example.com</p>
        </div>
        
        <Button variant="outlined">Perform PayPal Transaction</Button>
      </Stack>
    </div>
  );
};

export default OnRamp;

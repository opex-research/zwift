import React from "react";
import { Button, Typography, Stack } from "@mui/material";

const UserAccount = () => {
  let walletAddress = "0x8893200204820384";
  let walletBalance = "20Eth";
  let offRampAmount = "20Eth";

  return (
    <Stack
      direction="column"
      spacing={2}
      alignItems="center"
      style={{ padding: 16 }}
    >
      {/* "Sören" and "Logout" */}
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        spacing={2}
        alignItems="center"
      >
        <Typography variant="h4">Sören</Typography>
        <Button variant="text" sx={{ padding: 0 }}>
          Logout
        </Button>
      </Stack>
      {/* Wallet Address */}
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        spacing={2}
        alignItems="center"
      >
        <Typography variant="h6" component="div">
          Wallet Address:
        </Typography>
        <Typography component="div">{walletAddress}</Typography>
      </Stack>
      {/* Wallet Balance */}
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        spacing={2}
        alignItems="center"
      >
        <Typography variant="h6" component="div">
          Wallet Balance:
        </Typography>
        <Typography component="div">{walletBalance}</Typography>
      </Stack>
      {/* Open OffRamp */}
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        spacing={2}
        alignItems="center"
      >
        <Typography variant="h6" component="div">
          Open OffRamp:
        </Typography>
        <Typography component="div">{offRampAmount}</Typography>
      </Stack>
    </Stack>
  );
};

export default UserAccount;

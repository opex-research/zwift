import React from "react";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Logo from "../logo_zwift.webp"; // Adjust path as necessary

const LoginCard = ({ onLoginClick }) => {
  // Define a nicer blue color for the line and the button
  const niceBlueColor = "#89CFF0";

  return (
    <Card sx={{ maxWidth: 500, mx: 2, borderRadius: 4 }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginRight: "20px",
          }}
        >
          <img src={Logo} alt="Logo" style={{ height: "100px" }} />
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: niceBlueColor,
            borderWidth: "thin",
            marginRight: "20px",
            minHeight: "calc(100% - 16px)",
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ color: "black", fontWeight: "300", marginBottom: "8px" }}
          >
            Welcome to Zwift
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: "grey", fontWeight: "300", marginBottom: "20px" }}
          >
            Log in to your account to continue
          </Typography>
          <Button
            type="button"
            variant="contained"
            size="large"
            onClick={onLoginClick}
            sx={{
              backgroundColor: niceBlueColor,
              "&:hover": { backgroundColor: niceBlueColor },
              alignSelf: "flex-start",
            }}
          >
            Log In with MetaMask
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoginCard;

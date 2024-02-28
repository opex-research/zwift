import React from "react";
import { Tabs, Tab, Stack, Typography } from "@mui/material";
import OnRamp from "../Components/OnRamp";
import OffRamp from "../Components/OffRamp";
import UserAccount from "../Components/UserAccount";

const HomePage = () => {
  const [value, setValue] = React.useState("onramp");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Stack
      direction="row" // Stack direction set to row for horizontal layout
      divider={
        <div style={{ width: 1, height: "auto", backgroundColor: "#e0e0e0" }} />
      } // Optional divider
      spacing={0} // Adjust spacing to 0 or as required
      alignItems="stretch" // This will stretch the child components to fill the container height
      sx={{ height: "100vh", width: "100vw" }} // Ensure the Stack takes up the full viewport height and width
    >
      {/* Left column: UserAccount */}
      <Stack
        sx={{ width: "50%", justifyContent: "center", alignItems: "center" }}
      >
        <UserAccount />
      </Stack>

      {/* Right column: Tabs with OnRamp and OffRamp */}
      <Stack sx={{ width: "50%", justifyContent:"center", alignItems: "center" }} >
        <Typography variant="h4">Interact with your wallet</Typography>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab value="onramp" label="OnRamp" />
          <Tab value="offramp" label="OffRamp" />
        </Tabs>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            {value === "onramp" && <OnRamp />}
            {value === "offramp" && <OffRamp />}
          </div>
        </div>
      </Stack>
    </Stack>
  );
};

export default HomePage;

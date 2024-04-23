import React from "react";
import Typography from "@mui/material/Typography"; // Corrected import statement

const CustomTypographyValue = ({ value }) => {
  return (
    <Typography
      sx={{
        width: "100%",
        fontSize: 16,
        backgroundColor: "darkgray",
        borderRadius: "10px", // Adjust radius size as needed for desired curvature
        padding: "4px 8px", // Provides some padding inside the background
      }}
    >
      {value}
    </Typography>
  );
};

export default CustomTypographyValue;

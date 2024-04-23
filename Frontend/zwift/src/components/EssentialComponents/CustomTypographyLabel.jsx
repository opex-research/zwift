import React from "react";
import Typography from "@mui/material/Typography"; // Corrected import statement

const CustomTypographyLabel = ({ value }) => {
  return <Typography sx={{ width: "100%", fontSize: 18 }}>{value}</Typography>;
};

export default CustomTypographyLabel;

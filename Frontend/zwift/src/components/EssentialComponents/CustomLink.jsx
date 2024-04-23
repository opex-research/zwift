import React from "react";
import Typography from "@mui/material/Typography";

const TypographyLink = ({ displayText, urllink }) => {
  return (
    <a
      href={urllink} // Correct attribute for <a> tag
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Typography
        variant="h6" // Corrected Typography variant
        color="darkRed"
        sx={{
          ml: 3,
          letterSpacing: 2,
          "&:hover": {
            textDecoration: "underline", // Adds underline on hover
          },
        }}
      >
        {displayText}
      </Typography>
    </a>
  );
};

export default TypographyLink;

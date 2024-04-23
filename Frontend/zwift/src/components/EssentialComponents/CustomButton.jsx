import React from "react";
import Button from "@mui/material/Button";

const CustomButton = ({ onClick, disabled, buttonText }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      disabled={disabled}
      sx={{
        background: `${disabled ? "grey" : "darkred"} !important`,
        color: `${disabled ? "lightgrey" : "white"} !important`,
        borderRadius: "12px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
        "&:hover": {
          backgroundColor: `${disabled ? "grey" : "red"} !important`,
        },
        "&:active": {
          backgroundColor: `${disabled ? "grey" : "#cc0000"} !important`,
        },
        "& .MuiButton-startIcon": {
          color: `${disabled ? "lightgrey" : "darkred"} !important`,
        },
        "& .MuiButton-endIcon": {
          color: `${disabled ? "lightgrey" : "darkred"} !important`,
        },
        fontSize: 14,
        padding: "6px 12px",
        textTransform: "none",
        width: "fit-content",
      }}
    >
      {buttonText}
    </Button>
  );
};

export default CustomButton;

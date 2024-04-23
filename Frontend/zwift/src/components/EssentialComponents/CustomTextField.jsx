import React from "react";
import TextField from "@mui/material/TextField";

const CustomTextField = ({ value, onChange, label }) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      variant="outlined"
      disabled={true} // Ensure the prop is passed as a boolean, not a string
      inputProps={{
        style: {
          color: "white", // This sets the text color for the non-disabled state
        },
      }}
      sx={{
        width: "40%",
        backgroundColor: "#333",
        borderRadius: "12px",
        ".MuiOutlinedInput-root": {
          borderRadius: "12px",
          "& fieldset": {
            borderColor: "transparent",
            borderRadius: "12px",
          },
          "&:hover fieldset": {
            borderColor: "white",
          },
          "&.Mui-focused fieldset": {
            borderColor: "white",
          },
          "& .MuiInputBase-input": {
            fontSize: 16,
          },
          "&.Mui-disabled": {
            ".MuiInputBase-input": {
              color: "red", // Sets the text color to black when disabled
            },
          },
        },
      }}
    />
  );
};

export default CustomTextField;

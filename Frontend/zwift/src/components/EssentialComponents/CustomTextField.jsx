import React from "react";
import TextField from "@mui/material/TextField";

const CustomTextField = ({ value, onChange, label }) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      variant="outlined"
      inputProps={{
        style: {
          color: "white",
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
        },
      }}
    />
  );
};

export default CustomTextField;

import React from "react";
import { Snackbar, Alert } from "@mui/material";

/**
 * ErrorSnackbar component displays an error message in a snackbar.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls the visibility of the snackbar
 * @param {Function} props.handleClose - Function to close the snackbar
 * @param {string} props.errorMessage - The error message to display
 * @returns {React.Component} Rendered ErrorSnackbar component
 */
const ErrorSnackbar = ({ open, handleClose, errorMessage }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={handleClose}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
  >
    <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
      {errorMessage}
    </Alert>
  </Snackbar>
);

export default ErrorSnackbar;

import React from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
const OffRamp = () => {
  return (
    <div>
      <Stack direction="column" spacing={2}>
      <TextField label="Eth Amount" variant="outlined" type="number" />
      <Button variant='outlined'>Create OffRamp Intent</Button>
      </Stack>
    </div>
  );
};

export default OffRamp;

import React from 'react';
import { CircularProgress } from '@material-ui/core';

export default function SpinnerPage() {
  return (
    <CircularProgress
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <LoadingContainer>
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
        {message}
      </Typography>
    </LoadingContainer>
  );
};

export default LoadingSpinner;

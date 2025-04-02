import React from 'react';
import { useForm } from 'react-hook-form';
import { UserLoginData } from '../../shared/types/user';
import { TextField, Button, Box } from '@mui/material';

interface LoginFormProps {
  onSubmit: (data: UserLoginData) => void;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserLoginData>();

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        {...register('password', {
          required: 'Password is required'
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  );
}; 
import React from 'react';
import { useForm } from 'react-hook-form';
import { UserRegisterData } from '../../types/user';
import { TextField, Button, Box } from '@mui/material';

interface RegisterFormProps {
  onSubmit: (data: UserRegisterData) => void;
  isLoading: boolean;
}

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserRegisterData>();

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
        label="First Name"
        {...register('first_name', {
          required: 'First name is required',
          minLength: {
            value: 2,
            message: 'First name must be at least 2 characters'
          }
        })}
        error={!!errors.first_name}
        helperText={errors.first_name?.message}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Last Name"
        {...register('last_name', {
          required: 'Last name is required',
          minLength: {
            value: 2,
            message: 'Last name must be at least 2 characters'
          }
        })}
        error={!!errors.last_name}
        helperText={errors.last_name?.message}
      />

      <TextField
        margin="normal"
        fullWidth
        label="Phone"
        {...register('phone', {
          pattern: {
            value: phoneRegex,
            message: 'Invalid phone number format'
          }
        })}
        error={!!errors.phone}
        helperText={errors.phone?.message || 'Format: +1234567890'}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
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
        {isLoading ? 'Registering...' : 'Register'}
      </Button>
    </Box>
  );
}; 
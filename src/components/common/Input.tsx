// Reusable Input component

import React from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomInputProps extends TextInputProps {
  error?: boolean;
  errorMessage?: string;
}

export const Input: React.FC<CustomInputProps> = ({
  error,
  errorMessage,
  ...props
}) => {
  return (
    <TextInput
      mode="outlined"
      error={error || !!errorMessage}
      {...props}
      style={[styles.input, props.style]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
});




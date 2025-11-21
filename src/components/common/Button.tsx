// Reusable Button component

import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomButtonProps extends Omit<ButtonProps, 'mode'> {
  mode?: 'contained' | 'outlined' | 'text';
  fullWidth?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  mode = 'contained',
  fullWidth = false,
  style,
  ...props
}) => {
  return (
    <PaperButton
      mode={mode}
      style={[fullWidth && styles.fullWidth, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
});




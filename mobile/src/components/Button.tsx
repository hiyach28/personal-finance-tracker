import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

const Button = ({ onPress, title, variant = 'primary', style }: any) => {
  const C = useTheme();
  
  const buttonStyle = variant === 'secondary' 
    ? [styles.button, styles.secondary, { borderColor: C.accent }, style]
    : [styles.button, styles.primary, { backgroundColor: C.accent }, style];
    
  const textStyle = variant === 'secondary'
    ? [styles.text, { color: C.accent }]
    : [styles.text, styles.textPrimary];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
    >
      <Text style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  primary: {
    // Background color set dynamically
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // Border color set dynamically
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textPrimary: {
    color: '#fff',
  },
});

export default Button;

// app/components/Button.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Button = ({
  title,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  ...props
}) => {
 
  const renderButtonContent = () => {
    if (loading) {
      return <ActivityIndicator color={variant === 'outline' ? '#6200EE' : '#fff'} size="small" />;
    }
    
    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons 
            name={icon} 
            size={18} 
            color={variant === 'primary' ? '#fff' : '#6200EE'} 
            style={styles.leftIcon} 
          />
        )}
        <Text style={[
          variant === 'primary' ? styles.buttonText : styles.outlineText, 
          textStyle
        ]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <Ionicons 
            name={icon} 
            size={18} 
            color={variant === 'primary' ? '#fff' : '#6200EE'} 
            style={styles.rightIcon} 
          />
        )}
      </View>
    );
  };
  
  const buttonStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle(), style]}
      disabled={loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#6200EE',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
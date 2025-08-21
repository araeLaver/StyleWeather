import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoadingSpinner = ({ 
  message = '로딩 중...', 
  size = 'large', 
  overlay = false,
  color = '#4299e1' 
}) => {
  const containerStyle = overlay 
    ? [styles.container, styles.overlay]
    : styles.container;

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        <ActivityIndicator
          size={size}
          color={color}
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    color: '#4a5568',
    fontSize: 16,
    textAlign: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: height,
    left: 0,
    position: 'absolute',
    top: 0,
    width: width,
    zIndex: 1000,
  },
  spinner: {
    marginBottom: 16,
  },
});

export default LoadingSpinner;
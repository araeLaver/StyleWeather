import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

const NetworkError = ({ onRetry, message }) => {
  const defaultMessage = '인터넷 연결을 확인해주세요';
  
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📶</Text>
      <Text style={styles.title}>연결 오류</Text>
      <Text style={styles.message}>
        {message || defaultMessage}
      </Text>
      
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    color: '#4a5568',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4299e1',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#2d3748',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default NetworkError;
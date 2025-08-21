import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 에러 로깅 (향후 Sentry 등과 연동 가능)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReportError = () => {
    Alert.alert(
      '오류 신고',
      '개발자에게 오류를 신고하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '신고하기', 
          onPress: () => {
            // 여기에 오류 리포트 로직 추가
            Alert.alert('신고 완료', '오류가 신고되었습니다. 빠른 시일 내에 수정하겠습니다.');
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>앱에 오류가 발생했습니다</Text>
            <Text style={styles.errorMessage}>
              예상치 못한 오류가 발생했습니다.{'\n'}
              앱을 다시 시작하거나 잠시 후 시도해주세요.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>디버그 정보:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={this.handleRetry}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.reportButton]}
                onPress={this.handleReportError}
              >
                <Text style={styles.reportButtonText}>오류 신고</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  debugInfo: {
    backgroundColor: '#fed7d7',
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
    width: '100%',
  },
  debugText: {
    color: '#742a2a',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  debugTitle: {
    color: '#c53030',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    maxWidth: 320,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#4a5568',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#2d3748',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: '#e2e8f0',
  },
  reportButtonText: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#4299e1',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
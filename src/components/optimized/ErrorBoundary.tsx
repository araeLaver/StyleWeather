import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다.
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 리포팅 서비스에 에러를 기록할 수 있습니다
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 부모 컴포넌트에 에러 알림
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: {
        message: error?.message,
        stack: error?.stack,
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack,
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    console.log('Error Report:', JSON.stringify(errorReport, null, 2));
    
    // 여기서 실제 에러 리포팅 서비스로 전송할 수 있습니다
    // 예: Sentry, Bugsnag, 또는 자체 서버
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백이 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            
            <Text style={styles.title}>앱에서 오류가 발생했습니다</Text>
            <Text style={styles.subtitle}>
              예상치 못한 문제가 발생했습니다.{'\n'}
              다시 시도하거나 앱을 재시작해 주세요.
            </Text>

            {/* 에러 상세 정보 (개발 모드에서만) */}
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>에러 상세 정보 (개발 모드):</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack}>
                    {this.state.error.stack}
                  </Text>
                )}
                {this.state.errorInfo?.componentStack && (
                  <View style={styles.componentStackContainer}>
                    <Text style={styles.componentStackTitle}>Component Stack:</Text>
                    <Text style={styles.componentStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* 액션 버튼들 */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.retryButton]} 
                onPress={this.handleRetry}
              >
                <Text style={styles.retryButtonText}>🔄 다시 시도</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.reportButton]} 
                onPress={this.handleReportError}
              >
                <Text style={styles.reportButtonText}>📧 오류 신고</Text>
              </TouchableOpacity>
            </View>

            {/* 도움말 텍스트 */}
            <Text style={styles.helpText}>
              문제가 계속 발생하면 앱을 완전히 종료한 후 다시 실행해 주세요.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    maxWidth: 400,
    width: '100%',
    ...SHADOWS.md,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  errorIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  errorDetails: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    maxHeight: 200,
  },
  errorDetailsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  errorStack: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  componentStackContainer: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.sm,
  },
  componentStackTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  componentStack: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  reportButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  helpText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.disabled,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ErrorBoundary;
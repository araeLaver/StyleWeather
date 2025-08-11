import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

// 앱 로딩 중 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

const CustomSplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 애니메이션 시퀀스
    const startAnimation = () => {
      Animated.sequence([
        // 로고 나타나기
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        // 텍스트 나타나기
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // 잠시 대기
        Animated.delay(1000),
        // 페이드 아웃
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 애니메이션 완료 후 기본 스플래시 숨기기
        SplashScreen.hideAsync();
        if (onFinish) {
          onFinish();
        }
      });
    };

    // 약간의 지연 후 애니메이션 시작
    const timer = setTimeout(startAnimation, 300);
    
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, textFadeAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* 앱 로고/아이콘 */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🌤️</Text>
          <Text style={styles.logoText}>StyleWeather</Text>
        </View>

        {/* 앱 설명 */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: textFadeAnim },
          ]}
        >
          <Text style={styles.tagline}>AI 맞춤 코디 추천</Text>
          <Text style={styles.subtitle}>날씨와 일정에 맞는 스타일을 제안해드려요</Text>
        </Animated.View>

        {/* 로딩 인디케이터 */}
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: textFadeAnim },
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
        </Animated.View>
      </Animated.View>

      {/* 하단 브랜딩 */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: textFadeAnim },
        ]}
      >
        <Text style={styles.footerText}>Powered by AI</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d3748', // 앱의 기본 색상
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  tagline: {
    fontSize: 18,
    color: '#a0aec0',
    marginBottom: 8,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4299e1',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#718096',
    letterSpacing: 0.5,
  },
});

export default CustomSplashScreen;
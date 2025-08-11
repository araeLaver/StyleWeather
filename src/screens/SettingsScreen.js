import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config/config';
import DemoModeToggle from '../components/DemoModeToggle';

const SettingsScreen = ({ navigation }) => {
  const [userSettings, setUserSettings] = useState({
    gender: 'male',
    ageRange: '20-30',
    occupation: '직장인',
    stylePreference: 'casual',
    notifications: true,
    weatherAlerts: true,
    autoRecommendation: true
  });
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setUserSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('설정 로딩 실패:', error);
    }
  };

  const saveUserSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setUserSettings(newSettings);
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Alert.alert('오류', '설정을 저장할 수 없습니다.');
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...userSettings, [key]: value };
    saveUserSettings(newSettings);
  };

  const showSelectionAlert = (title, options, currentValue, settingKey) => {
    const buttons = options.map(option => ({
      text: option.label,
      onPress: () => updateSetting(settingKey, option.value),
      style: option.value === currentValue ? 'default' : 'cancel'
    }));
    
    buttons.push({
      text: '취소',
      style: 'cancel'
    });

    Alert.alert(title, '옵션을 선택하세요', buttons);
  };

  const clearUserData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 사용자 데이터가 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setUserSettings({
                gender: 'male',
                ageRange: '20-30',
                occupation: '직장인',
                stylePreference: 'casual',
                notifications: true,
                weatherAlerts: true,
                autoRecommendation: true
              });
              Alert.alert('완료', '데이터가 초기화되었습니다.');
            } catch (error) {
              Alert.alert('오류', '데이터 초기화에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 개인정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 개인정보</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => showSelectionAlert(
            '성별',
            [
              { label: '남성', value: 'male' },
              { label: '여성', value: 'female' }
            ],
            userSettings.gender,
            'gender'
          )}
        >
          <Text style={styles.settingLabel}>성별</Text>
          <Text style={styles.settingValue}>
            {userSettings.gender === 'male' ? '남성' : '여성'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => showSelectionAlert(
            '연령대',
            [
              { label: '10대', value: '10-19' },
              { label: '20대', value: '20-29' },
              { label: '30대', value: '30-39' },
              { label: '40대', value: '40-49' },
              { label: '50대 이상', value: '50+' }
            ],
            userSettings.ageRange,
            'ageRange'
          )}
        >
          <Text style={styles.settingLabel}>연령대</Text>
          <Text style={styles.settingValue}>
            {userSettings.ageRange.replace('-', '~')}세
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => showSelectionAlert(
            '직업',
            [
              { label: '학생', value: '학생' },
              { label: '직장인', value: '직장인' },
              { label: '전문직', value: '전문직' },
              { label: '프리랜서', value: '프리랜서' },
              { label: '주부', value: '주부' },
              { label: '기타', value: '기타' }
            ],
            userSettings.occupation,
            'occupation'
          )}
        >
          <Text style={styles.settingLabel}>직업</Text>
          <Text style={styles.settingValue}>{userSettings.occupation}</Text>
        </TouchableOpacity>
      </View>

      {/* 스타일 선호도 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ 스타일 선호도</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => showSelectionAlert(
            '선호 스타일',
            CONFIG.STYLE_OPTIONS.map(option => ({
              label: `${option.emoji} ${option.name}`,
              value: option.id
            })),
            userSettings.stylePreference,
            'stylePreference'
          )}
        >
          <Text style={styles.settingLabel}>기본 스타일</Text>
          <Text style={styles.settingValue}>
            {CONFIG.STYLE_OPTIONS.find(
              option => option.id === userSettings.stylePreference
            )?.name || '캐주얼'}
          </Text>
        </TouchableOpacity>

        {/* 스타일 옵션 미리보기 */}
        <View style={styles.stylePreview}>
          <Text style={styles.stylePreviewTitle}>스타일 옵션:</Text>
          <View style={styles.styleOptions}>
            {CONFIG.STYLE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.styleOption,
                  userSettings.stylePreference === option.id && styles.styleOptionSelected
                ]}
                onPress={() => updateSetting('stylePreference', option.id)}
              >
                <Text style={styles.styleEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.styleOptionText,
                  userSettings.stylePreference === option.id && styles.styleOptionTextSelected
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 알림 설정 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 알림 설정</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>푸시 알림</Text>
          <Switch
            value={userSettings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            trackColor={{ false: '#e2e8f0', true: '#4299e1' }}
            thumbColor={userSettings.notifications ? 'white' : '#a0aec0'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>날씨 알림</Text>
          <Switch
            value={userSettings.weatherAlerts}
            onValueChange={(value) => updateSetting('weatherAlerts', value)}
            trackColor={{ false: '#e2e8f0', true: '#4299e1' }}
            thumbColor={userSettings.weatherAlerts ? 'white' : '#a0aec0'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>자동 추천</Text>
          <Switch
            value={userSettings.autoRecommendation}
            onValueChange={(value) => updateSetting('autoRecommendation', value)}
            trackColor={{ false: '#e2e8f0', true: '#4299e1' }}
            thumbColor={userSettings.autoRecommendation ? 'white' : '#a0aec0'}
          />
        </View>
      </View>

      {/* 앱 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ 앱 정보</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>앱 버전</Text>
          <Text style={styles.settingValue}>{CONFIG.VERSION}</Text>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>개인정보처리방침</Text>
          <Text style={styles.settingArrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>서비스 이용약관</Text>
          <Text style={styles.settingArrow}>〉</Text>
        </TouchableOpacity>
      </View>

      {/* 개발자 도구 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛠️ 개발자 도구</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowDemoModal(true)}
        >
          <Text style={styles.settingLabel}>데모 모드 설정</Text>
          <Text style={styles.settingArrow}>〉</Text>
        </TouchableOpacity>
      </View>

      {/* 데이터 관리 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗂️ 데이터 관리</Text>
        
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={clearUserData}
        >
          <Text style={styles.dangerButtonText}>전체 데이터 초기화</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomPadding} />
    </ScrollView>
    
    {/* 데모 모드 토글 모달 */}
    <DemoModeToggle
      visible={showDemoModal}
      onClose={() => setShowDemoModal(false)}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2d3748',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: {
    fontSize: 14,
    color: '#4a5568',
  },
  settingValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: 'bold',
  },
  settingArrow: {
    fontSize: 16,
    color: '#a0aec0',
  },
  stylePreview: {
    marginTop: 16,
  },
  stylePreviewTitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  styleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleOption: {
    width: '18%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    marginBottom: 8,
  },
  styleOptionSelected: {
    backgroundColor: '#4299e1',
  },
  styleEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  styleOptionText: {
    fontSize: 10,
    color: '#4a5568',
    textAlign: 'center',
  },
  styleOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#fed7d7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#e53e3e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});

export default SettingsScreen;
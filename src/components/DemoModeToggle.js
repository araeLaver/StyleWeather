import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import DemoDataManager from '../utils/DemoData';

const DemoModeToggle = ({ visible, onClose }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('sunny');
  const [currentProfile, setCurrentProfile] = useState('male_office_worker');
  const [scenarios, setScenarios] = useState({});

  useEffect(() => {
    if (visible) {
      loadDemoStatus();
    }
  }, [visible]);

  const loadDemoStatus = () => {
    const status = DemoDataManager.getStatus();
    setIsDemoMode(status.isDemoMode);
    setCurrentScenario(status.currentWeatherScenario);
    setCurrentProfile(status.currentUserProfile);
    setScenarios(status.availableScenarios);
  };

  const toggleDemoMode = (enabled) => {
    DemoDataManager.setDemoMode(enabled);
    setIsDemoMode(enabled);
    
    if (enabled) {
      Alert.alert(
        '데모 모드 활성화',
        '데모 모드가 활성화되었습니다.\n실제 API 호출 없이 테스트 데이터를 사용합니다.',
        [{ text: '확인' }]
      );
    } else {
      Alert.alert(
        '데모 모드 비활성화',
        '실제 API를 사용하여 데이터를 가져옵니다.',
        [{ text: '확인' }]
      );
    }
  };

  const changeWeatherScenario = (scenario) => {
    const success = DemoDataManager.setWeatherScenario(scenario);
    if (success) {
      setCurrentScenario(scenario);
    }
  };

  const changeUserProfile = (profile) => {
    const success = DemoDataManager.setUserProfile(profile);
    if (success) {
      setCurrentProfile(profile);
    }
  };

  const setRandomScenario = () => {
    const result = DemoDataManager.setRandomScenario();
    setCurrentScenario(result.weather);
    setCurrentProfile(result.profile);
    
    Alert.alert(
      '랜덤 시나리오 설정',
      `날씨: ${result.weather}\n사용자: ${result.profile}`,
      [{ text: '확인' }]
    );
  };

  const getScenarioDisplayName = (key) => {
    const names = {
      sunny: '☀️ 맑음',
      cloudy: '☁️ 구름많음',
      rainy: '🌧️ 비',
      cold: '❄️ 추움',
      male_office_worker: '👨‍💼 남성 직장인',
      female_student: '👩‍🎓 여성 학생',
      male_freelancer: '👨‍💻 남성 프리랜서'
    };
    return names[key] || key;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧪 데모 모드 설정</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* 데모 모드 토글 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>데모 모드</Text>
              <Switch
                value={isDemoMode}
                onValueChange={toggleDemoMode}
                trackColor={{ false: '#e2e8f0', true: '#4299e1' }}
                thumbColor={isDemoMode ? 'white' : '#a0aec0'}
              />
            </View>
            <Text style={styles.sectionDescription}>
              {isDemoMode 
                ? '테스트 데이터를 사용하여 앱을 체험할 수 있습니다.'
                : '실제 API를 통해 데이터를 가져옵니다.'
              }
            </Text>
          </View>

          {isDemoMode && (
            <>
              {/* 날씨 시나리오 선택 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌤️ 날씨 시나리오</Text>
                <Text style={styles.currentSelection}>
                  현재: {getScenarioDisplayName(currentScenario)}
                </Text>
                
                <View style={styles.optionGrid}>
                  {scenarios.weather?.map(weather => (
                    <TouchableOpacity
                      key={weather}
                      style={[
                        styles.optionButton,
                        currentScenario === weather && styles.optionButtonSelected
                      ]}
                      onPress={() => changeWeatherScenario(weather)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        currentScenario === weather && styles.optionButtonTextSelected
                      ]}>
                        {getScenarioDisplayName(weather)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 사용자 프로필 선택 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 사용자 프로필</Text>
                <Text style={styles.currentSelection}>
                  현재: {getScenarioDisplayName(currentProfile)}
                </Text>
                
                <View style={styles.optionGrid}>
                  {scenarios.userProfiles?.map(profile => (
                    <TouchableOpacity
                      key={profile}
                      style={[
                        styles.optionButton,
                        currentProfile === profile && styles.optionButtonSelected
                      ]}
                      onPress={() => changeUserProfile(profile)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        currentProfile === profile && styles.optionButtonTextSelected
                      ]}>
                        {getScenarioDisplayName(profile)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 빠른 액션 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ 빠른 액션</Text>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={setRandomScenario}
                >
                  <Text style={styles.actionButtonText}>🎲 랜덤 시나리오 설정</Text>
                </TouchableOpacity>
              </View>

              {/* 데모 데이터 정보 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ 데모 데이터 정보</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    • 날씨 시나리오: {scenarios.weather?.length || 0}개
                  </Text>
                  <Text style={styles.infoText}>
                    • 사용자 프로필: {scenarios.userProfiles?.length || 0}개
                  </Text>
                  <Text style={styles.infoText}>
                    • 추천 템플릿: {scenarios.recommendations?.length || 0}개
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d3748',
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  currentSelection: {
    fontSize: 14,
    color: '#4299e1',
    marginBottom: 12,
    fontWeight: '600',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionButtonSelected: {
    backgroundColor: '#4299e1',
    borderColor: '#3182ce',
  },
  optionButtonText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  actionButton: {
    backgroundColor: '#38a169',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#4a5568',
    lineHeight: 18,
  },
});

export default DemoModeToggle;
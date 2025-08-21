import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, STYLE_OPTIONS } from '../constants';
import { useUserData } from '../hooks/useUserData';
import { useThemeContext } from '../components/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';
import type { NavigationProp } from '@react-navigation/native';
import type { UserPreferences } from '../types';

interface SettingsScreenProps {
  navigation: NavigationProp<any>;
}

interface SelectionData {
  title: string;
  options: { label: string; value: string }[];
  currentValue: string;
  settingKey: keyof UserPreferences;
}

const SettingsScreen: React.FC<SettingsScreenProps> = memo(({ navigation }) => {
  // 로컬 상태
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionData, setSelectionData] = useState<SelectionData>({
    title: '',
    options: [],
    currentValue: '',
    settingKey: 'gender'
  });

  // 테마 컨텍스트
  const { colors, isDarkMode } = useThemeContext();

  // Redux 상태 및 액션
  const { 
    preferences, 
    updateUserPreferences,
    clearUserError,
    resetUserData 
  } = useUserData();

  // 메모화된 계산값
  const colorOptions = useMemo(() => [
    'black', 'white', 'navy', 'gray', 'brown', 'beige', 
    'red', 'blue', 'green', 'yellow', 'purple', 'pink'
  ], []);

  const statusItems = useMemo(() => [
    {
      label: '선호 색상',
      value: `${(preferences.preferredColors || []).length}개 선택`
    },
    {
      label: '알림',
      value: preferences.notifications ? '활성화' : '비활성화'
    },
    {
      label: '언어',
      value: preferences.language === 'ko' ? '한국어' : 
             preferences.language === 'en' ? 'English' : '日本語'
    },
    {
      label: '데이터 동기화',
      value: preferences.dataSync ? '켜짐' : '꺼짐'
    }
  ], [preferences]);

  const settingsOptions = useMemo(() => ({
    gender: [
      { label: '👨 남성', value: 'male' },
      { label: '👩 여성', value: 'female' },
      { label: '🏳️‍⚧️ 기타', value: 'other' }
    ],
    ageRange: [
      { label: '🧒 10대', value: '10-19' },
      { label: '🧑 20대', value: '20-29' },
      { label: '🧑‍💼 30대', value: '30-39' },
      { label: '👨‍💼 40대', value: '40-49' },
      { label: '👨‍🦳 50대 이상', value: '50+' }
    ],
    occupation: [
      { label: '🎓 학생', value: '학생' },
      { label: '💼 직장인', value: '직장인' },
      { label: '⚖️ 전문직', value: '전문직' },
      { label: '💻 프리랜서', value: '프리랜서' },
      { label: '🏠 주부', value: '주부' },
      { label: '🎨 창작자', value: '창작자' },
      { label: '📊 기타', value: '기타' }
    ],
    bodyType: [
      { label: '💪 슬림', value: 'slim' },
      { label: '🧘‍♂️ 보통', value: 'average' },
      { label: '🤗 통통', value: 'curvy' },
      { label: '🏋️‍♂️ 근육질', value: 'athletic' }
    ],
    skinTone: [
      { label: '🌸 밝은톤', value: 'light' },
      { label: '🌼 보통톤', value: 'medium' },
      { label: '🌰 어두운톤', value: 'dark' },
      { label: '🌺 웜톤', value: 'warm' },
      { label: '❄️ 쿨톤', value: 'cool' }
    ],
    stylePreference: STYLE_OPTIONS.map(option => ({
      label: `${option.emoji} ${option.name}`,
      value: option.id
    })),
    formalLevel: [
      { label: '👔 매우 격식적', value: 'very_formal' },
      { label: '🤵 격식적', value: 'formal' },
      { label: '👔 비즈니스 캐주얼', value: 'business_casual' },
      { label: '👕 캐주얼', value: 'casual' },
      { label: '🏃‍♂️ 매우 캐주얼', value: 'very_casual' }
    ],
    budgetRange: [
      { label: '💰 고가 (50만원+)', value: 'high' },
      { label: '💳 중간 (20-50만원)', value: 'medium' },
      { label: '💵 저가 (10-20만원)', value: 'low' },
      { label: '🛍️ 초저가 (~10만원)', value: 'very_low' }
    ],
    lifestyle: [
      { label: '🏃‍♂️ 활동적', value: 'active' },
      { label: '🧘‍♀️ 여유로운', value: 'relaxed' },
      { label: '💼 비즈니스', value: 'business' },
      { label: '🎨 창의적', value: 'creative' },
      { label: '🌿 자연친화', value: 'natural' }
    ],
    weatherSensitivity: [
      { label: '🥶 매우 추위 탐', value: 'very_cold' },
      { label: '❄️ 추위 탐', value: 'cold' },
      { label: '🌤️ 보통', value: 'normal' },
      { label: '☀️ 더위 탐', value: 'warm' },
      { label: '🔥 매우 더위 탐', value: 'very_warm' }
    ],
    pushTiming: [
      { label: '🌅 이른 아침 (6:00)', value: 'early_morning' },
      { label: '☀️ 아침 (8:00)', value: 'morning' },
      { label: '🌤️ 오전 (10:00)', value: 'late_morning' },
      { label: '🌙 저녁 (18:00)', value: 'evening' }
    ],
    language: [
      { label: '🇰🇷 한국어', value: 'ko' },
      { label: '🇺🇸 English', value: 'en' },
      { label: '🇯🇵 日本語', value: 'ja' }
    ],
    units: [
      { label: '🌡️ 섭씨 (°C)', value: 'metric' },
      { label: '🌡️ 화씨 (°F)', value: 'imperial' }
    ]
  }), []);

  // 이벤트 핸들러들
  const updateSetting = useCallback(<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    console.log(`설정 업데이트: ${String(key)} = ${value}`);
    updateUserPreferences({ [key]: value });
  }, [updateUserPreferences]);

  const showSelectionAlert = useCallback(<K extends keyof UserPreferences>(
    title: string,
    options: { label: string; value: string }[],
    currentValue: string,
    settingKey: K
  ) => {
    setSelectionData({
      title,
      options,
      currentValue,
      settingKey: settingKey as keyof UserPreferences
    });
    setShowSelectionModal(true);
  }, []);

  const handleSelectionConfirm = useCallback((selectedValue: string, selectedLabel: string) => {
    console.log(`선택 확정: ${selectedLabel} (${selectedValue})`);
    updateSetting(selectionData.settingKey, selectedValue as any);
    setShowSelectionModal(false);
  }, [selectionData.settingKey, updateSetting]);

  const handleColorToggle = useCallback((color: string, isPreferred: boolean) => {
    const currentColors = isPreferred 
      ? (preferences.preferredColors || [])
      : (preferences.avoidColors || []);
    
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];
    
    const key = isPreferred ? 'preferredColors' : 'avoidColors';
    updateSetting(key, newColors);
  }, [preferences.preferredColors, preferences.avoidColors, updateSetting]);

  const clearUserData = useCallback(() => {
    Alert.alert(
      '⚠️ 데이터 초기화',
      '모든 사용자 설정과 데이터가 삭제되고 기본값으로 초기화됩니다. 이 작업은 되돌릴 수 없습니다.\n\n정말 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: () => {
            resetUserData();
            Alert.alert('완료', '✅ 모든 설정이 기본값으로 초기화되었습니다.');
          }
        }
      ]
    );
  }, [resetUserData]);

  const exportSettings = useCallback(() => {
    const settingsJson = JSON.stringify(preferences, null, 2);
    console.log('현재 설정:', settingsJson);
    Alert.alert(
      '📤 설정 내보내기',
      `현재 설정이 콘솔에 출력되었습니다.\n\n설정된 항목:\n- 선호 색상: ${(preferences.preferredColors || []).length}개\n- 피하는 색상: ${(preferences.avoidColors || []).length}개\n- 알림: ${preferences.notifications ? '켜짐' : '꺼짐'}\n- 언어: ${preferences.language || 'ko'}`
    );
  }, [preferences]);

  const applyTestSettings = useCallback(() => {
    const testSettings: Partial<UserPreferences> = {
      preferredColors: ['red', 'blue', 'green'],
      avoidColors: ['yellow', 'pink'],
      budgetRange: 'high',
      lifestyle: 'creative'
    };
    updateUserPreferences(testSettings);
    Alert.alert('완료', '🧪 테스트 설정이 적용되었습니다.');
  }, [updateUserPreferences]);

  const closeModal = useCallback(() => {
    setShowSelectionModal(false);
  }, []);

  // 값 표시 헬퍼 함수들
  const getDisplayValue = useCallback((key: keyof UserPreferences, value: any) => {
    const options = settingsOptions[key as keyof typeof settingsOptions];
    if (options) {
      const option = options.find(opt => opt.value === value);
      return option?.label || value;
    }
    return value;
  }, [settingsOptions]);

  const getGenderDisplay = useCallback((gender: string) => {
    return gender === 'male' ? '👨 남성' : 
           gender === 'female' ? '👩 여성' : '🏳️‍⚧️ 기타';
  }, []);

  const getAgeRangeDisplay = useCallback((ageRange: string) => {
    return (ageRange || '20-29').replace('-', '~') + '세';
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView style={styles.scrollContainer}>
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: colors.surface.elevated }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.text.inverse }]}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>설정</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 설정 상태 요약 */}
        <View style={[styles.statusSection, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.statusTitle}>🎯 현재 설정 상태</Text>
          <View style={styles.statusGrid}>
            {statusItems.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <Text style={styles.statusLabel}>{item.label}</Text>
                <Text style={styles.statusValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 개인정보 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>👤 기본 프로필</Text>
          <Text style={styles.sectionDescription}>정확한 추천을 위한 기본 정보</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '성별',
              settingsOptions.gender,
              preferences.gender,
              'gender'
            )}
          >
            <Text style={styles.settingLabel}>성별</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getGenderDisplay(preferences.gender)}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '연령대',
              settingsOptions.ageRange,
              preferences.ageRange,
              'ageRange'
            )}
          >
            <Text style={styles.settingLabel}>연령대</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getAgeRangeDisplay(preferences.ageRange)}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '직업',
              settingsOptions.occupation,
              preferences.occupation,
              'occupation'
            )}
          >
            <Text style={styles.settingLabel}>직업</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{preferences.occupation}</Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '체형',
              settingsOptions.bodyType,
              preferences.bodyType || 'average',
              'bodyType'
            )}
          >
            <Text style={styles.settingLabel}>체형</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('bodyType', preferences.bodyType || 'average')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '피부톤',
              settingsOptions.skinTone,
              preferences.skinTone || 'medium',
              'skinTone'
            )}
          >
            <Text style={styles.settingLabel}>피부톤</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('skinTone', preferences.skinTone || 'medium')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 스타일 선호도 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>✨ 스타일 선호도</Text>
          <Text style={styles.sectionDescription}>당신만의 스타일을 설정해보세요</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '기본 스타일',
              settingsOptions.stylePreference,
              preferences.stylePreference,
              'stylePreference'
            )}
          >
            <Text style={styles.settingLabel}>기본 스타일</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {STYLE_OPTIONS.find(option => option.id === preferences.stylePreference)?.name || '캐주얼'}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '격식 수준',
              settingsOptions.formalLevel,
              preferences.formalLevel || 'business_casual',
              'formalLevel'
            )}
          >
            <Text style={styles.settingLabel}>격식 수준</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('formalLevel', preferences.formalLevel || 'business_casual')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '예산 범위',
              settingsOptions.budgetRange,
              preferences.budgetRange || 'medium',
              'budgetRange'
            )}
          >
            <Text style={styles.settingLabel}>예산 범위</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('budgetRange', preferences.budgetRange || 'medium')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '라이프스타일',
              settingsOptions.lifestyle,
              preferences.lifestyle || 'active',
              'lifestyle'
            )}
          >
            <Text style={styles.settingLabel}>라이프스타일</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('lifestyle', preferences.lifestyle || 'active')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          {/* 스타일 옵션 미리보기 */}
          <View style={styles.stylePreview}>
            <Text style={styles.stylePreviewTitle}>빠른 스타일 선택:</Text>
            <View style={styles.styleOptions}>
              {STYLE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.styleOption,
                    preferences.stylePreference === option.id && styles.styleOptionSelected
                  ]}
                  onPress={() => updateSetting('stylePreference', option.id)}
                >
                  <Text style={styles.styleEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.styleOptionText,
                    preferences.stylePreference === option.id && styles.styleOptionTextSelected
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 색상 선호도 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>🎨 색상 선호도</Text>
          <Text style={styles.sectionDescription}>좋아하는 색상과 피하고 싶은 색상</Text>
          
          <View style={styles.colorSection}>
            <Text style={styles.colorSectionTitle}>선호 색상</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color === 'white' ? COLORS.gray[100] : color },
                    (preferences.preferredColors || []).includes(color) && styles.colorButtonSelected
                  ]}
                  onPress={() => handleColorToggle(color, true)}
                >
                  {(preferences.preferredColors || []).includes(color) && (
                    <Text style={styles.colorCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.colorSection}>
            <Text style={styles.colorSectionTitle}>피하고 싶은 색상</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color === 'white' ? COLORS.gray[100] : color },
                    (preferences.avoidColors || []).includes(color) && styles.colorButtonAvoid
                  ]}
                  onPress={() => handleColorToggle(color, false)}
                >
                  {(preferences.avoidColors || []).includes(color) && (
                    <Text style={styles.colorCross}>✕</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 날씨 민감도 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>🌡️ 날씨 민감도</Text>
          <Text style={styles.sectionDescription}>추위와 더위에 대한 민감도 설정</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '날씨 민감도',
              settingsOptions.weatherSensitivity,
              preferences.weatherSensitivity || 'normal',
              'weatherSensitivity'
            )}
          >
            <Text style={styles.settingLabel}>온도 민감도</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('weatherSensitivity', preferences.weatherSensitivity || 'normal')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 알림 설정 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>🔔 알림 설정</Text>
          <Text style={styles.sectionDescription}>알림 타이밍과 방식을 설정하세요</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>푸시 알림</Text>
              <Text style={styles.settingSubLabel}>코디 추천 및 일반 알림</Text>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
              thumbColor={preferences.notifications ? COLORS.white : COLORS.gray[400]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>날씨 알림</Text>
              <Text style={styles.settingSubLabel}>날씨 변화 및 특보 알림</Text>
            </View>
            <Switch
              value={preferences.weatherAlerts}
              onValueChange={(value) => updateSetting('weatherAlerts', value)}
              trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
              thumbColor={preferences.weatherAlerts ? COLORS.white : COLORS.gray[400]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>자동 추천</Text>
              <Text style={styles.settingSubLabel}>매일 자동으로 코디 추천</Text>
            </View>
            <Switch
              value={preferences.autoRecommendation}
              onValueChange={(value) => updateSetting('autoRecommendation', value)}
              trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
              thumbColor={preferences.autoRecommendation ? COLORS.white : COLORS.gray[400]}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '알림 시간',
              settingsOptions.pushTiming,
              preferences.pushTiming || 'morning',
              'pushTiming'
            )}
          >
            <Text style={styles.settingLabel}>알림 시간</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('pushTiming', preferences.pushTiming || 'morning')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 개인정보 및 데이터 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>🔒 개인정보 및 데이터</Text>
          <Text style={styles.sectionDescription}>데이터 동기화 및 위치 정보 설정</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>위치 정보 사용</Text>
              <Text style={styles.settingSubLabel}>정확한 날씨 정보를 위해 필요</Text>
            </View>
            <Switch
              value={preferences.locationSharing || true}
              onValueChange={(value) => updateSetting('locationSharing', value)}
              trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
              thumbColor={preferences.locationSharing ? COLORS.white : COLORS.gray[400]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>데이터 동기화</Text>
              <Text style={styles.settingSubLabel}>설정 및 선호도 클라우드 저장</Text>
            </View>
            <Switch
              value={preferences.dataSync || true}
              onValueChange={(value) => updateSetting('dataSync', value)}
              trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
              thumbColor={preferences.dataSync ? COLORS.white : COLORS.gray[400]}
            />
          </View>
        </View>

        {/* 테마 설정 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>🎨 테마 설정</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>앱의 외관을 설정하세요</Text>
          
          <View style={styles.themeToggleContainer}>
            <ThemeToggle size="medium" showLabel={true} />
          </View>
        </View>

        {/* 앱 설정 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>⚙️ 앱 설정</Text>
          <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>언어 및 단위 설정</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '언어 설정',
              settingsOptions.language,
              preferences.language || 'ko',
              'language'
            )}
          >
            <Text style={styles.settingLabel}>언어</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('language', preferences.language || 'ko')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showSelectionAlert(
              '단위 설정',
              settingsOptions.units,
              preferences.units || 'metric',
              'units'
            )}
          >
            <Text style={styles.settingLabel}>온도 단위</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {getDisplayValue('units', preferences.units || 'metric')}
              </Text>
              <Text style={styles.settingArrow}>〉</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 앱 정보 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>ℹ️ 앱 정보</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>앱 버전</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
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

        {/* 데이터 관리 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.sectionTitle}>🗂️ 데이터 관리</Text>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={exportSettings}
            >
              <Text style={styles.exportButtonText}>📤 설정 내보내기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={applyTestSettings}
            >
              <Text style={styles.testButtonText}>🧪 테스트 설정</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={clearUserData}
          >
            <Text style={styles.dangerButtonText}>🗑️ 전체 데이터 초기화</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 선택 모달 */}
      <Modal
        visible={showSelectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectionData.title}</Text>
            <TouchableOpacity 
              onPress={closeModal}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectionData.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalOption,
                  option.value === selectionData.currentValue && styles.modalOptionSelected
                ]}
                onPress={() => handleSelectionConfirm(option.value, option.label)}
              >
                <Text style={[
                  styles.modalOptionText,
                  option.value === selectionData.currentValue && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                  {option.value === selectionData.currentValue && ' ✓'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[800],
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: 50,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  section: {
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  themeToggleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: COLORS.gray[100],
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubLabel: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    lineHeight: 16,
  },
  settingValueContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingValue: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  settingArrow: {
    color: COLORS.text.disabled,
    fontSize: FONT_SIZES.base,
  },
  stylePreview: {
    marginTop: SPACING.lg,
  },
  stylePreviewTitle: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.sm,
  },
  styleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleOption: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    width: '18%',
  },
  styleOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  styleEmoji: {
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  styleOptionText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  styleOptionTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  exportButton: {
    alignItems: 'center',
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    marginRight: SPACING.sm,
    padding: SPACING.lg,
  },
  exportButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  testButton: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    marginLeft: SPACING.sm,
    padding: SPACING.lg,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: '#FED7D7',
    borderColor: '#FCA5A5',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  dangerButtonText: {
    color: '#DC2626',
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  // === 상태 요약 섹션 ===
  statusSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  statusTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    width: '48%',
  },
  statusLabel: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  statusValue: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },

  // === 색상 선택 스타일 ===
  colorSection: {
    marginTop: SPACING.lg,
  },
  colorSectionTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  colorButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    margin: 4,
    width: 36,
  },
  colorButtonSelected: {
    borderColor: COLORS.success,
    borderWidth: 3,
  },
  colorButtonAvoid: {
    borderColor: COLORS.error,
    borderWidth: 3,
  },
  colorCheckmark: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  colorCross: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  bottomPadding: {
    height: 30,
  },

  // === 선택 모달 스타일 ===
  modalContainer: {
    backgroundColor: COLORS.background.primary,
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[800],
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: 50,
  },
  modalTitle: {
    color: COLORS.white,
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalCloseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  modalCloseText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalOption: {
    backgroundColor: COLORS.white,
    borderColor: 'transparent',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    marginBottom: SPACING.sm,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  modalOptionSelected: {
    backgroundColor: '#E6F3FF',
    borderColor: COLORS.primary,
  },
  modalOptionText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

SettingsScreen.displayName = 'SettingsScreen';

export default SettingsScreen;
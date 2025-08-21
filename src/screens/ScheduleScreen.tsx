import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { useUserData } from '../hooks/useUserData';
import { useThemeContext } from '../components/ThemeProvider';
import type { NavigationProp } from '@react-navigation/native';
import type { Schedule, StyleRecommendation } from '../types';

interface ScheduleScreenProps {
  navigation: NavigationProp<any>;
}

interface NewScheduleData {
  title: string;
  time: string;
  type: string;
  location?: string;
  description?: string;
  date: string;
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = memo(({ navigation }) => {
  // 테마 컨텍스트
  const { colors, isDarkMode } = useThemeContext();

  // 로컬 상태
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newSchedule, setNewSchedule] = useState<NewScheduleData>({
    title: '',
    time: '',
    type: 'casual',
    location: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Redux 상태 및 액션
  const { 
    schedules,
    preferences,
    loading: userDataLoading,
    addNewSchedule,
    updateExistingSchedule,
    removeSchedule,
    getSchedulesForDate
  } = useUserData();

  // 메모화된 계산값
  const selectedDateSchedules = useMemo(() => 
    getSchedulesForDate(selectedDate),
    [schedules, selectedDate, getSchedulesForDate]
  );

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentMonth]);

  const scheduleTypes = useMemo(() => [
    { value: 'business', label: '💼 비즈니스', color: COLORS.info },
    { value: 'casual', label: '☕ 일상', color: COLORS.success },
    { value: 'date', label: '💕 데이트', color: COLORS.error },
    { value: 'exercise', label: '🏃‍♂️ 운동', color: COLORS.warning },
    { value: 'formal', label: '🎩 정식', color: '#553c9a' }
  ], []);

  // 유틸리티 함수들
  const generateRecommendation = useCallback((scheduleType: string): StyleRecommendation => {
    // 사용자 성별 확인 (기본값은 남성)
    const userGender = preferences?.gender || 'male';
    
    const maleRecommendations: Record<string, StyleRecommendation> = {
      business: {
        top: '정장 셔츠',
        bottom: '정장 바지',
        outer: '블레이저',
        shoes: '구두',
        accessories: '시계, 넥타이',
        reason: '비즈니스 미팅에 적합한 정장 스타일',
        confidence: 0.9,
        timestamp: Date.now()
      },
      casual: {
        top: '컴포터블 티셔츠',
        bottom: '청바지',
        outer: '카디건',
        shoes: '스니커즈',
        accessories: '백팩',
        reason: '편안하고 남성스러운 일상 스타일',
        confidence: 0.85,
        timestamp: Date.now()
      },
      date: {
        top: '니트 스웨터',
        bottom: '슬랙스',
        outer: '코트',
        shoes: '로퍼',
        accessories: '시계, 향수',
        reason: '세련하고 매력적인 데이트 룩',
        confidence: 0.88,
        timestamp: Date.now()
      },
      exercise: {
        top: '운동복 상의',
        bottom: '운동복 하의',
        outer: '후드집업',
        shoes: '운동화',
        accessories: '물병, 수건',
        reason: '활동적이고 기능적인 운동복',
        confidence: 0.95,
        timestamp: Date.now()
      },
      formal: {
        top: '드레스 셔츠',
        bottom: '정장 바지',
        outer: '정장 재킷',
        shoes: '정장화',
        accessories: '커프스 링크',
        reason: '격식을 갖춘 정중한 복장',
        confidence: 0.92,
        timestamp: Date.now()
      }
    };
    
    const femaleRecommendations: Record<string, StyleRecommendation> = {
      business: {
        top: '블라우스',
        bottom: '정장 스커트',
        outer: '블레이저',
        shoes: '힘',
        accessories: '백, 시계',
        reason: '비즈니스에 적합한 세련한 스타일',
        confidence: 0.9,
        timestamp: Date.now()
      },
      casual: {
        top: '컴포터블 티셔츠',
        bottom: '청바지',
        outer: '가디건',
        shoes: '스니커즈',
        accessories: '백, 액세서리',
        reason: '편안하고 자연스러운 일상 스타일',
        confidence: 0.85,
        timestamp: Date.now()
      },
      date: {
        top: '예쁜 블라우스',
        bottom: '스커트',
        outer: '코트',
        shoes: '힐',
        accessories: '목걸이, 핸드백',
        reason: '로맨틱하고 세련된 데이트 룩',
        confidence: 0.88,
        timestamp: Date.now()
      },
      exercise: {
        top: '운동복 상의',
        bottom: '운동복 하의',
        outer: '후드집업',
        shoes: '운동화',
        accessories: '물병, 수건',
        reason: '활동적이고 기능적인 운동복',
        confidence: 0.95,
        timestamp: Date.now()
      },
      formal: {
        top: '드레스',
        bottom: '정장 스커트',
        outer: '재킷',
        shoes: '힐',
        accessories: '주얼리, 클러치',
        reason: '격식을 갖례 우아한 복장',
        confidence: 0.92,
        timestamp: Date.now()
      }
    };
    
    // 성별에 따라 적절한 추천 선택
    const recommendations = userGender === 'female' ? femaleRecommendations : maleRecommendations;
    
    return recommendations[scheduleType] || recommendations.casual;
  }, [preferences?.gender]);

  const getScheduleTypeIcon = useCallback((type: string) => {
    const icons: Record<string, string> = {
      business: '💼',
      casual: '☕',
      date: '💕',
      exercise: '🏃‍♂️',
      formal: '🎩'
    };
    return icons[type] || '📅';
  }, []);

  const getScheduleTypeColor = useCallback((type: string) => {
    const colors: Record<string, string> = {
      business: COLORS.info,
      casual: COLORS.success,
      date: COLORS.error,
      exercise: COLORS.warning,
      formal: '#553c9a'
    };
    return colors[type] || COLORS.gray[600];
  }, []);

  // 이벤트 핸들러들
  const handleAddOrUpdateSchedule = useCallback(() => {
    console.log('일정 저장 버튼 클릭됨:', newSchedule);
    
    if (!newSchedule.title || !newSchedule.time) {
      console.log('입력 오류: 제목 또는 시간 누락');
      Alert.alert('입력 오류', '제목과 시간을 입력해주세요.');
      return;
    }

    try {
      const scheduleDate = newSchedule.date || selectedDate;
      const recommendedStyle = generateRecommendation(newSchedule.type);
      console.log('생성된 추천 스타일:', recommendedStyle);
      
      const scheduleToSave: Omit<Schedule, 'id'> = {
        ...newSchedule,
        type: newSchedule.type as 'business' | 'casual' | 'date' | 'exercise' | 'formal',
        date: scheduleDate,
        recommendedStyle
      };

      if (editingSchedule) {
        console.log('기존 일정 수정:', editingSchedule.id);
        updateExistingSchedule(editingSchedule.id, scheduleToSave);
        Alert.alert('성공', '✅ 일정이 수정되었습니다!');
      } else {
        console.log('새 일정 추가');
        addNewSchedule(scheduleToSave);
        Alert.alert('성공', '✅ 새 일정이 추가되었습니다!');
      }
      
      setShowAddModal(false);
      setEditingSchedule(null);
      setNewSchedule({
        title: '',
        time: '',
        type: 'casual',
        location: '',
        description: '',
        date: selectedDate
      });
      console.log('일정 저장 완료');
    } catch (error) {
      console.error('일정 저장 실패:', error);
      Alert.alert('오류', '일정 저장에 실패했습니다.');
    }
  }, [newSchedule, selectedDate, editingSchedule, generateRecommendation, addNewSchedule, updateExistingSchedule]);

  const handleDeleteSchedule = useCallback((scheduleId: string) => {
    console.log('삭제 버튼 클릭됨:', scheduleId);
    Alert.alert(
      '일정 삭제',
      '정말로 이 일정을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            console.log('일정 삭제 실행:', scheduleId);
            removeSchedule(scheduleId);
            Alert.alert('완료', '🗑️ 일정이 삭제되었습니다.');
          }
        }
      ]
    );
  }, [removeSchedule]);

  const handleEditSchedule = useCallback((schedule: Schedule) => {
    console.log('편집 버튼 클릭됨:', schedule.id, schedule.title);
    setEditingSchedule(schedule);
    setNewSchedule({
      title: schedule.title,
      time: schedule.time,
      type: schedule.type,
      location: schedule.location || '',
      description: schedule.description || '',
      date: schedule.date || selectedDate
    });
    setShowAddModal(true);
    console.log('편집 모달 열림');
  }, [selectedDate]);

  const handleGenerateNewRecommendation = useCallback((schedule: Schedule) => {
    console.log('🔄 다시추천 버튼 클릭됨');
    console.log('스케줄 정보:', { id: schedule.id, type: schedule.type, title: schedule.title });
    
    if (!schedule.id) {
      console.error('❌ 스케줄 ID가 없습니다');
      Alert.alert('오류', 'ID가 없는 일정입니다.');
      return;
    }

    try {
      console.log('📝 새 추천 생성 시작...');
      const newRecommendation = generateRecommendation(schedule.type);
      console.log('✅ 새 추천 생성됨:', newRecommendation);
      
      console.log('💾 추천 업데이트 시작...');
      updateExistingSchedule(schedule.id, { recommendedStyle: newRecommendation });
      console.log('✅ 추천 업데이트 완료');
      
      Alert.alert('완료', '🔄 새로운 추천을 생성했습니다!');
    } catch (error) {
      console.error('❌ 새 추천 생성 실패:', error);
      Alert.alert('오류', `추천 생성에 실패했습니다: ${error}`);
    }
  }, [generateRecommendation, updateExistingSchedule]);

  // 날짜 선택 핸들러
  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDateTime(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      setNewSchedule(prev => ({ ...prev, date: dateString }));
    }
  }, []);

  // 시간 선택 핸들러
  const handleTimeChange = useCallback((event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedDateTime(selectedTime);
      const timeString = selectedTime.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      setNewSchedule(prev => ({ ...prev, time: timeString }));
    }
  }, []);

  // 날짜 선택 버튼
  const showDateSelection = useCallback(() => {
    console.log('📅 날짜 선택 버튼 클릭됨');
    
    // 웹에서는 input type="date" 사용
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'date';
      input.value = newSchedule.date || selectedDate;
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const dateValue = target.value;
        console.log('선택된 날짜:', dateValue);
        setNewSchedule(prev => ({ ...prev, date: dateValue }));
        setSelectedDate(dateValue);
        document.body.removeChild(input);
      };
      
      input.click();
    } else {
      setShowDatePicker(true);
    }
  }, [newSchedule.date, selectedDate]);

  // 시간 선택 버튼
  const showTimeSelection = useCallback(() => {
    console.log('🕐 시간 선택 버튼 클릭됨');
    
    // 웹에서는 input type="time" 사용
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'time';
      input.value = newSchedule.time || '';
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const timeValue = target.value;
        console.log('선택된 시간:', timeValue);
        setNewSchedule(prev => ({ ...prev, time: timeValue }));
        document.body.removeChild(input);
      };
      
      input.click();
    } else {
      setShowTimePicker(true);
    }
  }, [newSchedule.time]);

  const handleFeedback = useCallback((schedule: Schedule) => {
    console.log('피드백 버튼 클릭됨:', schedule.id);
    Alert.alert('피드백 감사합니다!', '👍 좋은 추천이었다니 기뻐요! 😊');
  }, []);

  const changeMonth = useCallback((direction: number) => {
    console.log('달력 월 변경:', direction > 0 ? '다음달' : '이전달');
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    console.log('새로운 월:', newMonth.getMonth() + 1);
  }, [currentMonth]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // useUserData 훅이 자동으로 데이터를 관리하므로 별도 액션 불필요
    setRefreshing(false);
  }, []);

  const openAddModal = useCallback(() => {
    console.log('➕ 일정 추가 버튼 클릭됨');
    console.log('현재 선택된 날짜:', selectedDate);
    
    setEditingSchedule(null);
    setNewSchedule({
      title: '',
      time: '',
      type: 'casual',
      location: '',
      description: '',
      date: selectedDate
    });
    setShowAddModal(true);
    console.log('✅ 새 일정 모달 열림');
  }, [selectedDate]);

  const closeModal = useCallback(() => {
    console.log('모달 닫기 버튼 클릭됨');
    setShowAddModal(false);
    setEditingSchedule(null);
  }, []);


  if (loading || userDataLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>일정을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text.inverse }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>일정 관리</Text>
        <TouchableOpacity
          onPress={() => setShowCalendar(!showCalendar)}
          style={[styles.calendarToggleButton, { backgroundColor: colors.background.secondary }]}
        >
          <Text style={[styles.calendarToggleText, { color: colors.text.inverse }]}>{showCalendar ? '목록' : '달력'}</Text>
        </TouchableOpacity>
      </View>

      {/* 달력 뷰 */}
      {showCalendar && (
        <View style={[styles.calendarContainer, { backgroundColor: colors.background.primary }]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={[styles.monthButton, { backgroundColor: colors.background.primary }]}>
              <Text style={[styles.monthButtonText, { color: colors.text.primary }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text.primary }]}>
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={[styles.monthButton, { backgroundColor: colors.background.primary }]}>
              <Text style={[styles.monthButtonText, { color: colors.text.primary }]}>›</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekDaysContainer}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <Text key={index} style={[styles.weekDayText, { color: colors.text.secondary }]}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {calendarDays.map((date, index) => {
              const dateString = date.toISOString().split('T')[0];
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = dateString === selectedDate;
              const isToday = dateString === new Date().toISOString().split('T')[0];
              const daySchedules = getSchedulesForDate(dateString);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    !isCurrentMonth && styles.calendarDayOtherMonth,
                    isSelected && styles.calendarDaySelected,
                    isToday && styles.calendarDayToday,
                  ]}
                  onPress={() => setSelectedDate(dateString)}
                >
                  <Text style={[
                    styles.calendarDayText,
                    { color: colors.text.primary },
                    !isCurrentMonth && { color: colors.text.disabled },
                    isSelected && { color: colors.text.inverse },
                    isToday && { color: '#92400E' },
                  ]}>
                    {date.getDate()}
                  </Text>
                  {daySchedules.length > 0 && (
                    <View style={styles.calendarDayDot}>
                      <Text style={styles.calendarDayDotText}>{daySchedules.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* 선택된 날짜 표시 */}
      <View style={[styles.selectedDateContainer, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.selectedDateText, { color: colors.text.primary }]}>
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </Text>
        <TouchableOpacity onPress={openAddModal} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.addButtonText, { color: colors.text.inverse }]}>+ 일정 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 일정 목록 */}
      {selectedDateSchedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📅</Text>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>오늘 일정이 없습니다</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
            새로운 일정을 추가하여{'\n'}맞춤 코디를 추천받으세요
          </Text>
          <TouchableOpacity style={[styles.connectButton, { backgroundColor: colors.primary }]} onPress={openAddModal}>
            <Text style={[styles.connectButtonText, { color: colors.text.inverse }]}>일정 추가하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        selectedDateSchedules.map((schedule) => (
          <View key={schedule.id} style={[styles.scheduleCard, { backgroundColor: colors.background.primary }]}>
            {/* 일정 헤더 */}
            <View style={styles.scheduleHeader}>
              <View style={styles.scheduleTime}>
                <Text style={[styles.timeText, { color: colors.text.primary }]}>{schedule.time}</Text>
                <Text style={[
                  styles.typeIcon,
                  { color: getScheduleTypeColor(schedule.type) }
                ]}>
                  {getScheduleTypeIcon(schedule.type)}
                </Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={[styles.scheduleTitle, { color: colors.text.primary }]}>{schedule.title}</Text>
                {schedule.location && (
                  <Text style={[styles.scheduleLocation, { color: colors.text.secondary }]}>📍 {schedule.location}</Text>
                )}
                {schedule.description && (
                  <Text style={[styles.scheduleDescription, { color: colors.text.secondary }]}>
                    {schedule.description}
                  </Text>
                )}
              </View>
            </View>

            {/* 추천 코디 */}
            {schedule.recommendedStyle && (
              <View style={[styles.recommendationSection, { backgroundColor: colors.background.secondary }]}>
                <Text style={[styles.recommendationTitle, { color: colors.text.primary }]}>
                  👗 추천 코디
                </Text>
                
                <View style={styles.styleGrid}>
                  {schedule.recommendedStyle.top && (
                    <View style={[styles.styleItem, { backgroundColor: colors.background.primary }]}>
                      <Text style={[styles.styleCategory, { color: colors.text.secondary }]}>상의</Text>
                      <Text style={[styles.styleText, { color: colors.text.primary }]}>
                        {schedule.recommendedStyle.top}
                      </Text>
                    </View>
                  )}
                  
                  {schedule.recommendedStyle.bottom && (
                    <View style={[styles.styleItem, { backgroundColor: colors.background.primary }]}>
                      <Text style={[styles.styleCategory, { color: colors.text.secondary }]}>하의</Text>
                      <Text style={[styles.styleText, { color: colors.text.primary }]}>
                        {schedule.recommendedStyle.bottom}
                      </Text>
                    </View>
                  )}
                  
                  {schedule.recommendedStyle.outer && (
                    <View style={[styles.styleItem, { backgroundColor: colors.background.primary }]}>
                      <Text style={[styles.styleCategory, { color: colors.text.secondary }]}>아우터</Text>
                      <Text style={[styles.styleText, { color: colors.text.primary }]}>
                        {schedule.recommendedStyle.outer}
                      </Text>
                    </View>
                  )}
                  
                  {schedule.recommendedStyle.shoes && (
                    <View style={[styles.styleItem, { backgroundColor: colors.background.primary }]}>
                      <Text style={[styles.styleCategory, { color: colors.text.secondary }]}>신발</Text>
                      <Text style={[styles.styleText, { color: colors.text.primary }]}>
                        {schedule.recommendedStyle.shoes}
                      </Text>
                    </View>
                  )}
                </View>

                {schedule.recommendedStyle.accessories && (
                  <View style={[styles.accessoryContainer, { backgroundColor: colors.background.primary }]}>
                    <Text style={[styles.accessoryLabel, { color: colors.text.secondary }]}>액세서리:</Text>
                    <Text style={[styles.accessoryText, { color: colors.text.primary }]}>
                      {schedule.recommendedStyle.accessories}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 액션 버튼 */}
            <View style={styles.scheduleActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.background.secondary }]}
                onPress={() => handleFeedback(schedule)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>💖 마음에 들어요</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.background.secondary }]}
                onPress={() => handleGenerateNewRecommendation(schedule)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>🔄 다시 추천</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditSchedule(schedule)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text.inverse }]}>✏️ 편집</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteSchedule(schedule.id)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text.inverse }]}>🗑️ 삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* 하단 여백 */}
      <View style={styles.bottomPadding} />

      {/* 일정 추가/편집 모달 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background.primary }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.background.primary }]}>
            <TouchableOpacity 
              onPress={closeModal}
              style={styles.modalBackButton}
            >
              <Text style={[styles.modalBackText, { color: colors.text.inverse }]}>취소</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text.inverse }]}>
              {editingSchedule ? '일정 편집' : '새 일정 추가'}
            </Text>
            <TouchableOpacity 
              onPress={handleAddOrUpdateSchedule}
              style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.modalSaveText, { color: colors.text.inverse }]}>저장</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text.primary }]}>제목 *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background.primary, color: colors.text.primary, borderColor: colors.border?.medium || '#E5E7EB' }]}
                value={newSchedule.title}
                onChangeText={(text) => setNewSchedule(prev => ({...prev, title: text}))}
                placeholder="일정 제목을 입력하세요"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text.primary }]}>시간 *</Text>
              <TouchableOpacity 
                style={[styles.formInput, styles.timeButton, { backgroundColor: colors.background.primary, borderColor: colors.border?.medium || '#E5E7EB' }]}
                onPress={showTimeSelection}
              >
                <Text style={[styles.timeButtonText, { color: newSchedule.time ? colors.text.primary : colors.text.secondary }]}>
                  {newSchedule.time || '시간 선택'}
                </Text>
                <Text style={[styles.timeButtonIcon, { color: colors.text.secondary }]}>🕐</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text.primary }]}>일정 유형</Text>
              <ScrollView horizontal style={styles.typeSelector}>
                {scheduleTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      { backgroundColor: type.color },
                      newSchedule.type === type.value && styles.typeButtonSelected
                    ]}
                    onPress={() => setNewSchedule(prev => ({...prev, type: type.value}))}
                  >
                    <Text style={[styles.typeButtonText, { color: colors.text.inverse }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text.primary }]}>장소</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background.primary, color: colors.text.primary, borderColor: colors.border?.medium || '#E5E7EB' }]}
                value={newSchedule.location}
                onChangeText={(text) => setNewSchedule(prev => ({...prev, location: text}))}
                placeholder="장소를 입력하세요"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text.primary }]}>날짜</Text>
              <TouchableOpacity 
                style={[styles.formInput, styles.timeButton, { backgroundColor: colors.background.primary, borderColor: colors.border?.medium || '#E5E7EB' }]}
                onPress={showDateSelection}
              >
                <Text style={[styles.timeButtonText, { color: newSchedule.date ? colors.text.primary : colors.text.secondary }]}>
                  {newSchedule.date || '날짜 선택'}
                </Text>
                <Text style={[styles.timeButtonIcon, { color: colors.text.secondary }]}>📅</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text.primary }]}>설명</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: colors.background.primary, color: colors.text.primary, borderColor: colors.border?.medium || '#E5E7EB' }]}
                value={newSchedule.description}
                onChangeText={(text) => setNewSchedule(prev => ({...prev, description: text}))}
                placeholder="일정에 대한 추가 정보"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 날짜 선택기 */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDateTime}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* 시간 선택기 */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedDateTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.base,
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
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  calendarToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  calendarToggleText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 60,
    padding: SPACING['2xl'],
  },
  emptyText: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  connectButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  scheduleTime: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    minWidth: 60,
  },
  timeText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  typeIcon: {
    fontSize: 20,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  scheduleLocation: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  scheduleDescription: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  recommendationSection: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  recommendationTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    width: '48%',
  },
  styleCategory: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  styleText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
  },
  accessoryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    marginTop: SPACING.sm,
    padding: SPACING.md,
  },
  accessoryLabel: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  accessoryText: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: FONT_SIZES.xs,
  },
  scheduleActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: -SPACING.xs,
  },
  actionButton: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xs,
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },

  // === 모달 스타일 ===
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
  modalBackButton: {
    padding: SPACING.sm,
  },
  modalBackText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
  },
  modalTitle: {
    color: COLORS.white,
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  modalSaveText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  formInput: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    fontSize: FONT_SIZES.base,
    padding: SPACING.md,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButtonText: {
    fontSize: FONT_SIZES.base,
    flex: 1,
  },
  timeButtonIcon: {
    fontSize: FONT_SIZES.lg,
    marginLeft: SPACING.sm,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeButton: {
    borderColor: 'transparent',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  typeButtonSelected: {
    borderColor: COLORS.white,
    borderWidth: 2,
  },
  typeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  
  // === 캘린더 스타일 ===
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  monthButton: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  monthButtonText: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekDayText: {
    color: COLORS.text.secondary,
    flex: 1,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    paddingVertical: SPACING.sm,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
    width: '14.285%',
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayToday: {
    backgroundColor: '#FEF3C7',
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
  calendarDayText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  calendarDayTextOtherMonth: {
    color: COLORS.text.disabled,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  calendarDayTextToday: {
    color: '#92400E',
    fontWeight: 'bold',
  },
  calendarDayDot: {
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    position: 'absolute',
    right: 2,
    top: 2,
  },
  calendarDayDotText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedDateContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  selectedDateText: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  datePickerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  datePickerText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
});

ScheduleScreen.displayName = 'ScheduleScreen';

export default ScheduleScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';

const ScheduleScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      // TODO: Google Calendar API 연동
      // 현재는 더미 데이터 사용
      const dummySchedules = [
        {
          id: '1',
          title: '회사 미팅',
          time: '09:00',
          type: 'business',
          location: '회의실 A',
          description: '프로젝트 진행 상황 회의',
          recommendedStyle: {
            top: '와이셔츠',
            bottom: '정장 바지',
            outer: '블레이저',
            shoes: '구두',
            accessories: '시계, 넥타이'
          }
        },
        {
          id: '2',
          title: '점심 약속',
          time: '13:00',
          type: 'casual',
          location: '강남역 카페',
          description: '친구와의 점심 모임',
          recommendedStyle: {
            top: '니트',
            bottom: '청바지',
            outer: '가디건',
            shoes: '스니커즈',
            accessories: '가방'
          }
        },
        {
          id: '3',
          title: '저녁 데이트',
          time: '19:00',
          type: 'date',
          location: '한강공원',
          description: '연인과의 저녁 산책',
          recommendedStyle: {
            top: '예쁜 블라우스',
            bottom: '스커트',
            outer: '코트',
            shoes: '앵클부츠',
            accessories: '목걸이, 핸드백'
          }
        }
      ];
      
      setSchedules(dummySchedules);
    } catch (error) {
      console.error('일정 로딩 실패:', error);
      Alert.alert('오류', '일정 정보를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  };

  const getScheduleTypeIcon = (type) => {
    switch (type) {
      case 'business':
        return '💼';
      case 'casual':
        return '☕';
      case 'date':
        return '💕';
      case 'exercise':
        return '🏃‍♂️';
      case 'formal':
        return '🎩';
      default:
        return '📅';
    }
  };

  const getScheduleTypeColor = (type) => {
    switch (type) {
      case 'business':
        return '#2b6cb0';
      case 'casual':
        return '#38a169';
      case 'date':
        return '#e53e3e';
      case 'exercise':
        return '#d69e2e';
      case 'formal':
        return '#553c9a';
      default:
        return '#4a5568';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>일정을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오늘의 일정</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 일정 목록 */}
      {schedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📅</Text>
          <Text style={styles.emptyTitle}>오늘 일정이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            Google 캘린더를 연동하여{'\n'}일정별 맞춤 코디를 추천받으세요
          </Text>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>캘린더 연동하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        schedules.map((schedule) => (
          <View key={schedule.id} style={styles.scheduleCard}>
            {/* 일정 헤더 */}
            <View style={styles.scheduleHeader}>
              <View style={styles.scheduleTime}>
                <Text style={styles.timeText}>{schedule.time}</Text>
                <Text style={[
                  styles.typeIcon,
                  { color: getScheduleTypeColor(schedule.type) }
                ]}>
                  {getScheduleTypeIcon(schedule.type)}
                </Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                <Text style={styles.scheduleLocation}>📍 {schedule.location}</Text>
                {schedule.description && (
                  <Text style={styles.scheduleDescription}>
                    {schedule.description}
                  </Text>
                )}
              </View>
            </View>

            {/* 추천 코디 */}
            {schedule.recommendedStyle && (
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>
                  👗 추천 코디
                </Text>
                
                <View style={styles.styleGrid}>
                  {schedule.recommendedStyle.top && (
                    <View style={styles.styleItem}>
                      <Text style={styles.styleCategory}>상의</Text>
                      <Text style={styles.styleText}>
                        {schedule.recommendedStyle.top}
                      </Text>
                    </View>
                  )}
                  
                  {schedule.recommendedStyle.bottom && (
                    <View style={styles.styleItem}>
                      <Text style={styles.styleCategory}>하의</Text>
                      <Text style={styles.styleText}>
                        {schedule.recommendedStyle.bottom}
                      </Text>
                    </View>
                  )}
                  
                  {schedule.recommendedStyle.outer && (
                    <View style={styles.styleItem}>
                      <Text style={styles.styleCategory}>아우터</Text>
                      <Text style={styles.styleText}>
                        {schedule.recommendedStyle.outer}
                      </Text>
                    </View>
                  )}
                  
                  {schedule.recommendedStyle.shoes && (
                    <View style={styles.styleItem}>
                      <Text style={styles.styleCategory}>신발</Text>
                      <Text style={styles.styleText}>
                        {schedule.recommendedStyle.shoes}
                      </Text>
                    </View>
                  )}
                </View>

                {schedule.recommendedStyle.accessories && (
                  <View style={styles.accessoryContainer}>
                    <Text style={styles.accessoryLabel}>액세서리:</Text>
                    <Text style={styles.accessoryText}>
                      {schedule.recommendedStyle.accessories}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 액션 버튼 */}
            <View style={styles.scheduleActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>👍 좋아요</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>🔄 다시 추천</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* 하단 여백 */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: '#4299e1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  scheduleTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  typeIcon: {
    fontSize: 20,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  scheduleLocation: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  recommendationSection: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  styleCategory: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 2,
  },
  styleText: {
    fontSize: 13,
    color: '#2d3748',
  },
  accessoryContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    flexDirection: 'row',
  },
  accessoryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
    marginRight: 8,
  },
  accessoryText: {
    fontSize: 12,
    color: '#2d3748',
    flex: 1,
  },
  scheduleActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4a5568',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ScheduleScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// 간단한 날씨 데이터 타입
interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

// 코디 추천 타입
interface OutfitRecommendation {
  top: string;
  bottom: string;
  outer?: string;
  shoes: string;
  accessories?: string;
  reason: string;
}

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  // 날씨 기반 코디 추천 로직
  const getOutfitRecommendation = (temp: number): OutfitRecommendation => {
    if (temp >= 28) {
      return {
        top: '린넨 반팔 셔츠',
        bottom: '면 반바지',
        shoes: '캔버스 스니커즈',
        accessories: '선글라스, 모자',
        reason: `${temp}°C 더운 날씨에는 시원하고 통풍이 잘 되는 옷을 입으세요.`
      };
    } else if (temp >= 23) {
      return {
        top: '코튼 티셔츠',
        bottom: '청바지',
        shoes: '운동화',
        accessories: '가벼운 가방',
        reason: `${temp}°C 따뜻한 날씨에는 편안한 캐주얼 복장이 좋습니다.`
      };
    } else if (temp >= 18) {
      return {
        top: '긴팔 셔츠',
        bottom: '면바지',
        outer: '가벼운 가디건',
        shoes: '로퍼',
        accessories: '시계',
        reason: `${temp}°C 선선한 날씨에는 가벼운 겉옷을 준비하세요.`
      };
    } else if (temp >= 10) {
      return {
        top: '니트 스웨터',
        bottom: '청바지',
        outer: '자켓',
        shoes: '부츠',
        accessories: '머플러',
        reason: `${temp}°C 쌀쌀한 날씨에는 따뜻한 겉옷이 필요합니다.`
      };
    } else {
      return {
        top: '두꺼운 니트',
        bottom: '기모 바지',
        outer: '패딩 또는 코트',
        shoes: '방한 부츠',
        accessories: '장갑, 목도리, 모자',
        reason: `${temp}°C 추운 날씨에는 충분한 방한복을 입으세요.`
      };
    }
  };

  // Mock 날씨 데이터 (실제로는 API에서 가져옴)
  const fetchWeather = async () => {
    setLoading(true);
    
    // 시뮬레이션을 위한 랜덤 온도
    const randomTemp = Math.floor(Math.random() * 35) + 5; // 5-40도
    const conditions = ['맑음', '구름많음', '흐림', '비', '눈'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    setTimeout(() => {
      const weatherData: WeatherData = {
        temperature: randomTemp,
        condition: randomCondition,
        location: '서울'
      };
      
      setWeather(weatherData);
      setOutfit(getOutfitRecommendation(randomTemp));
      setLoading(false);
    }, 1000);
  };

  // 새로운 코디 추천
  const getNewOutfit = () => {
    if (!weather) return;
    
    // 같은 온도 범위에서 다른 옵션 제공
    const temp = weather.temperature;
    let newOutfit: OutfitRecommendation;
    
    if (temp >= 28) {
      const options = [
        {
          top: '린넨 반팔 셔츠',
          bottom: '면 반바지',
          shoes: '캔버스 스니커즈',
          accessories: '선글라스, 모자',
          reason: `${temp}°C 더운 날씨에는 시원하고 통풍이 잘 되는 옷을 입으세요.`
        },
        {
          top: '민소매 탑',
          bottom: '린넨 치마',
          shoes: '샌들',
          accessories: '선글라스',
          reason: `${temp}°C 더운 날씨에는 최대한 시원한 복장이 좋습니다.`
        },
        {
          top: '망사 티셔츠',
          bottom: '쿨링 팬츠',
          shoes: '통풍 스니커즈',
          accessories: '쿨링 타월',
          reason: `${temp}°C 더운 날씨에는 기능성 소재를 선택하세요.`
        }
      ];
      newOutfit = options[Math.floor(Math.random() * options.length)];
    } else if (temp >= 23) {
      const options = [
        {
          top: '코튼 티셔츠',
          bottom: '청바지',
          shoes: '운동화',
          accessories: '가벼운 가방',
          reason: `${temp}°C 따뜻한 날씨에는 편안한 캐주얼 복장이 좋습니다.`
        },
        {
          top: '폴로 셔츠',
          bottom: '치노 팬츠',
          shoes: '로퍼',
          accessories: '벨트',
          reason: `${temp}°C 따뜻한 날씨에는 깔끔한 스타일도 좋습니다.`
        },
        {
          top: '블라우스',
          bottom: '면 스커트',
          shoes: '플랫 슈즈',
          accessories: '크로스백',
          reason: `${temp}°C 따뜻한 날씨에는 여성스러운 스타일도 추천합니다.`
        }
      ];
      newOutfit = options[Math.floor(Math.random() * options.length)];
    } else if (temp >= 18) {
      const options = [
        {
          top: '긴팔 셔츠',
          bottom: '면바지',
          outer: '가벼운 가디건',
          shoes: '로퍼',
          accessories: '시계',
          reason: `${temp}°C 선선한 날씨에는 가벼운 겉옷을 준비하세요.`
        },
        {
          top: '얇은 니트',
          bottom: '슬랙스',
          outer: '트렌치코트',
          shoes: '옥스포드 슈즈',
          accessories: '가죽 가방',
          reason: `${temp}°C 선선한 날씨에는 세미 정장 스타일도 좋습니다.`
        }
      ];
      newOutfit = options[Math.floor(Math.random() * options.length)];
    } else if (temp >= 10) {
      const options = [
        {
          top: '니트 스웨터',
          bottom: '청바지',
          outer: '자켓',
          shoes: '부츠',
          accessories: '머플러',
          reason: `${temp}°C 쌀쌀한 날씨에는 따뜻한 겉옷이 필요합니다.`
        },
        {
          top: '후드티',
          bottom: '조거 팬츠',
          outer: '바람막이',
          shoes: '운동화',
          accessories: '비니',
          reason: `${temp}°C 쌀쌀한 날씨에는 스포티한 스타일도 좋습니다.`
        }
      ];
      newOutfit = options[Math.floor(Math.random() * options.length)];
    } else {
      const options = [
        {
          top: '두꺼운 니트',
          bottom: '기모 바지',
          outer: '패딩',
          shoes: '방한 부츠',
          accessories: '장갑, 목도리, 모자',
          reason: `${temp}°C 추운 날씨에는 충분한 방한복을 입으세요.`
        },
        {
          top: '기모 후드티',
          bottom: '기모 바지',
          outer: '롱 패딩',
          shoes: '털 부츠',
          accessories: '방한 장갑, 귀마개',
          reason: `${temp}°C 추운 날씨에는 완벽한 방한이 필요합니다.`
        }
      ];
      newOutfit = options[Math.floor(Math.random() * options.length)];
    }
    
    setOutfit(newOutfit);
    Alert.alert('새로운 코디!', '더 마음에 드는 스타일로 추천했어요!');
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>🌤️ 날씨별 코디 추천</Text>
        </View>

        {/* 날씨 정보 */}
        {weather && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherLocation}>📍 {weather.location}</Text>
            <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </View>
        )}

        {/* 코디 추천 */}
        {outfit && (
          <View style={styles.outfitCard}>
            <Text style={styles.outfitTitle}>👔 추천 코디</Text>
            
            <View style={styles.outfitItems}>
              <View style={styles.outfitItem}>
                <Text style={styles.itemLabel}>👕 상의</Text>
                <Text style={styles.itemValue}>{outfit.top}</Text>
              </View>
              
              <View style={styles.outfitItem}>
                <Text style={styles.itemLabel}>👖 하의</Text>
                <Text style={styles.itemValue}>{outfit.bottom}</Text>
              </View>
              
              {outfit.outer && (
                <View style={styles.outfitItem}>
                  <Text style={styles.itemLabel}>🧥 겉옷</Text>
                  <Text style={styles.itemValue}>{outfit.outer}</Text>
                </View>
              )}
              
              <View style={styles.outfitItem}>
                <Text style={styles.itemLabel}>👞 신발</Text>
                <Text style={styles.itemValue}>{outfit.shoes}</Text>
              </View>
              
              {outfit.accessories && (
                <View style={styles.outfitItem}>
                  <Text style={styles.itemLabel}>👜 액세서리</Text>
                  <Text style={styles.itemValue}>{outfit.accessories}</Text>
                </View>
              )}
            </View>

            <View style={styles.reasonCard}>
              <Text style={styles.reasonTitle}>💡 추천 이유</Text>
              <Text style={styles.reasonText}>{outfit.reason}</Text>
            </View>

            {/* 액션 버튼 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.refreshButton} onPress={getNewOutfit}>
                <Text style={styles.buttonText}>🔄 다른 코디</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.weatherButton} onPress={fetchWeather}>
                <Text style={styles.buttonText}>🌤️ 날씨 새로고침</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>날씨 정보를 가져오는 중...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  weatherCondition: {
    fontSize: 18,
    color: '#333',
  },
  outfitCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  outfitItems: {
    marginBottom: 20,
  },
  outfitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  itemValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  reasonCard: {
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  weatherButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
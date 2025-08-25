import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import WeatherService from './src/services/WeatherService';
import type { WeatherData } from './src/types';

// 위치 정보 타입
interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

// 쇼핑 아이템 타입
interface ShoppingItem {
  name: string;
  price: string;
  url: string;
  store: string;
  image?: string;
}

// 코디 추천 타입
interface OutfitRecommendation {
  top: string;
  bottom: string;
  outer?: string;
  shoes: string;
  accessories?: string;
  reason: string;
  shoppingItems?: {
    top?: ShoppingItem[];
    bottom?: ShoppingItem[];
    outer?: ShoppingItem[];
    shoes?: ShoppingItem[];
    accessories?: ShoppingItem[];
  };
}

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // 위치 권한 요청 및 현재 위치 가져오기
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '날씨 정보를 가져오려면 위치 권한이 필요합니다.',
          [{ text: '확인' }]
        );
        return;
      }

      // 현재 위치 가져오기
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      // 위치명 가져오기 (옵션)
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const location = reverseGeocode[0];
          locationData.city = location.city || location.district || location.region;
        }
      } catch (geocodeError) {
        console.log('Geocoding failed:', geocodeError);
      }

      setLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        '위치 오류',
        '현재 위치를 가져올 수 없습니다. 설정에서 위치 권한을 확인해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // 실제 날씨 데이터 가져오기
  const fetchWeatherData = async (locationData?: LocationData) => {
    try {
      setLoading(true);
      
      const targetLocation = locationData || location;
      if (!targetLocation) {
        throw new Error('위치 정보가 없습니다.');
      }

      const weatherData = await WeatherService.getCurrentWeather(
        targetLocation.latitude,
        targetLocation.longitude
      );

      setWeather(weatherData);
      
      // 날씨 기반 코디 추천 생성
      const recommendation = getOutfitRecommendation(weatherData);
      setOutfit(recommendation);
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      Alert.alert(
        '날씨 정보 오류',
        '날씨 정보를 가져올 수 없습니다. 인터넷 연결을 확인해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // 앱 시작시 위치 및 날씨 정보 가져오기
  useEffect(() => {
    const initializeApp = async () => {
      const locationData = await getCurrentLocation();
      if (locationData) {
        await fetchWeatherData(locationData);
      }
    };
    
    initializeApp();
  }, []);

  // 쇼핑 아이템 데이터 (실제로는 API에서 가져와야 함)
  const getShoppingItems = (category: string, keyword: string): ShoppingItem[] => {
    // 실제 구현에서는 네이버 쇼핑, 쿠팡, G마켓 등의 API 호출
    const mockItems: { [key: string]: ShoppingItem[] } = {
      '린넨 반팔': [
        { name: '린넨 반팔 셔츠 화이트', price: '29,000원', url: 'https://search.shopping.naver.com/search/all?query=린넨+반팔+셔츠', store: '네이버쇼핑' },
        { name: '코튼 린넨 블렌드 티셔츠', price: '35,000원', url: 'https://www.coupang.com/np/search?q=린넨+반팔', store: '쿠팡' }
      ],
      '면 반바지': [
        { name: '면 100% 캐주얼 반바지', price: '25,000원', url: 'https://search.shopping.naver.com/search/all?query=면+반바지', store: '네이버쇼핑' },
        { name: '코튼 치노 쇼츠', price: '32,000원', url: 'https://www.coupang.com/np/search?q=코튼+반바지', store: '쿠팡' }
      ],
      '캔버스 스니커즈': [
        { name: '캔버스 스니커즈 화이트', price: '59,000원', url: 'https://search.shopping.naver.com/search/all?query=캔버스+스니커즈', store: '네이버쇼핑' },
        { name: '클래식 캔버스 운동화', price: '45,000원', url: 'https://www.coupang.com/np/search?q=캔버스+스니커즈', store: '쿠팡' }
      ],
      '선글라스': [
        { name: 'UV차단 선글라스', price: '15,000원', url: 'https://search.shopping.naver.com/search/all?query=선글라스', store: '네이버쇼핑' },
        { name: '편광 선글라스', price: '28,000원', url: 'https://www.coupang.com/np/search?q=선글라스', store: '쿠팡' }
      ]
    };

    return mockItems[keyword] || [
      { name: `${keyword} 상품`, price: '가격 문의', url: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(keyword)}`, store: '네이버쇼핑' }
    ];
  };

  // 개선된 날씨 기반 코디 추천 로직
  const getOutfitRecommendation = (weatherData: WeatherData): OutfitRecommendation => {
    const { temperature, humidity, windSpeed, description } = weatherData;
    const isRainy = description.includes('비') || description.includes('rain');
    const isSnowy = description.includes('눈') || description.includes('snow');
    const isCloudy = description.includes('구름') || description.includes('cloud');
    const isWet = humidity > 70;
    const isWindy = windSpeed > 5;

    // 기본 온도별 추천
    let baseRecommendation: OutfitRecommendation;

    if (temperature >= 28) {
      baseRecommendation = {
        top: '린넨 반팔 셔츠 또는 민소매',
        bottom: '면 반바지 또는 린넨 치마',
        shoes: '통풍 좋은 샌들 또는 캔버스 신발',
        accessories: '선글라스, 모자, 부채',
        reason: `${temperature}°C 매우 더운 날씨`
      };
    } else if (temperature >= 23) {
      baseRecommendation = {
        top: '반팔 티셔츠 또는 얇은 블라우스',
        bottom: '면바지 또는 가벼운 치마',
        shoes: '스니커즈 또는 로퍼',
        accessories: '선글라스, 가벼운 가방',
        reason: `${temperature}°C 따뜻한 날씨`
      };
    } else if (temperature >= 18) {
      baseRecommendation = {
        top: '긴팔 셔츠 또는 얇은 니트',
        bottom: '청바지 또는 면바지',
        outer: '가벼운 가디건 또는 재킷',
        shoes: '운동화 또는 로퍼',
        accessories: '가벼운 스카프',
        reason: `${temperature}°C 선선한 날씨`
      };
    } else if (temperature >= 10) {
      baseRecommendation = {
        top: '니트 또는 맨투맨',
        bottom: '청바지 또는 두꺼운 바지',
        outer: '재킷 또는 코트',
        shoes: '부츠 또는 운동화',
        accessories: '목도리, 장갑',
        reason: `${temperature}°C 쌀쌀한 날씨`
      };
    } else if (temperature >= 5) {
      baseRecommendation = {
        top: '두꺼운 니트 또는 후드티',
        bottom: '기모 바지 또는 두꺼운 청바지',
        outer: '두꺼운 코트 또는 패딩',
        shoes: '방한 부츠',
        accessories: '장갑, 목도리, 모자',
        reason: `${temperature}°C 추운 날씨`
      };
    } else {
      baseRecommendation = {
        top: '기모 내복, 두꺼운 니트',
        bottom: '기모 바지',
        outer: '패딩 또는 두꺼운 코트',
        shoes: '방한 부츠',
        accessories: '장갑, 목도리, 모자, 귀마개',
        reason: `${temperature}°C 매우 추운 날씨`
      };
    }

    // 날씨 조건에 따른 추가 조정
    let additionalRecommendations: string[] = [];

    if (isRainy) {
      additionalRecommendations.push('우산 필수');
      additionalRecommendations.push('방수 재킷');
      additionalRecommendations.push('방수 신발 또는 장화');
      if (baseRecommendation.outer) {
        baseRecommendation.outer = `방수 ${baseRecommendation.outer}`;
      }
    }

    if (isSnowy) {
      additionalRecommendations.push('미끄럼 방지 신발');
      additionalRecommendations.push('방수 아우터');
      if (temperature > 0) {
        additionalRecommendations.push('젖을 수 있으니 여벌 양말');
      }
    }

    if (isWet) {
      additionalRecommendations.push('통풍이 잘 되는 소재 선택');
      additionalRecommendations.push('면 소재 추천');
    }

    if (isWindy) {
      additionalRecommendations.push('바람막이 재킷');
      additionalRecommendations.push('모자나 후드 착용');
      if (temperature < 15) {
        additionalRecommendations.push('보온 중요 (체감온도 더 낮음)');
      }
    }

    if (isCloudy && temperature < 20) {
      additionalRecommendations.push('얇은 가디건 준비 (기온 변화 대비)');
    }

    // 최종 추천 이유 생성
    let finalReason = baseRecommendation.reason;
    
    if (additionalRecommendations.length > 0) {
      finalReason += `. 날씨 특성상 ${additionalRecommendations.join(', ')}을(를) 고려하세요.`;
    }

    if (humidity > 70) {
      finalReason += ` 습도가 ${humidity}%로 높아 끈적할 수 있습니다.`;
    }

    if (windSpeed > 3) {
      finalReason += ` 바람이 ${windSpeed}m/s로 강하니 체감온도가 낮을 수 있습니다.`;
    }

    // 쇼핑 아이템 추가
    const shoppingItems = {
      top: getShoppingItems('top', baseRecommendation.top.split(' ')[0] + ' ' + baseRecommendation.top.split(' ')[1]),
      bottom: getShoppingItems('bottom', baseRecommendation.bottom.split(' ')[0] + ' ' + baseRecommendation.bottom.split(' ')[1]),
      shoes: getShoppingItems('shoes', baseRecommendation.shoes.split(' ')[0] + ' ' + baseRecommendation.shoes.split(' ')[1]),
      ...(baseRecommendation.outer && {
        outer: getShoppingItems('outer', baseRecommendation.outer.split(' ')[0] + ' ' + baseRecommendation.outer.split(' ')[1])
      }),
      ...(baseRecommendation.accessories && {
        accessories: getShoppingItems('accessories', baseRecommendation.accessories.split(',')[0].trim())
      })
    };

    return {
      ...baseRecommendation,
      reason: finalReason,
      shoppingItems
    };
  };


  // 쇼핑 링크 열기
  const openShoppingLink = async (url: string, storeName: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('Link opening error:', error);
      Alert.alert('오류', `${storeName} 링크를 여는 중 문제가 발생했습니다.`);
    }
  };

  // 새로운 코디 추천
  const getNewOutfit = () => {
    if (!weather) return;
    
    // 같은 날씨 조건에서 다른 스타일 옵션 제공
    const newRecommendation = getOutfitRecommendation(weather);
    setOutfit(newRecommendation);
    Alert.alert('새로운 코디!', '현재 날씨에 맞는 새로운 스타일을 추천했어요!');
  };



  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>🌤️ 날씨별 코디 추천</Text>
        </View>

        {/* 위치 정보 */}
        {location && (
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>
              📍 {location.city || `위도: ${location.latitude.toFixed(4)}, 경도: ${location.longitude.toFixed(4)}`}
            </Text>
          </View>
        )}

        {/* 날씨 정보 */}
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>날씨 정보를 가져오는 중...</Text>
          </View>
        ) : weather ? (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherLocation}>🌤️ {weather.city || '현재 위치'} 날씨</Text>
            <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
            <Text style={styles.weatherCondition}>{weather.description}</Text>
            <Text style={styles.weatherDetails}>
              체감온도: {weather.feelsLike}°C | 습도: {weather.humidity}% | 바람: {weather.windSpeed}m/s
            </Text>
            {weather.isMock && (
              <Text style={styles.mockIndicator}>⚠️ 데모 데이터 (실제 API 키를 설정해주세요)</Text>
            )}
          </View>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>날씨 정보를 불러올 수 없습니다.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchWeatherData()}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
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
              
              <TouchableOpacity style={styles.weatherButton} onPress={() => fetchWeatherData()}>
                <Text style={styles.buttonText}>🌤️ 날씨 새로고침</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                <Text style={styles.buttonText}>📍 위치 새로고침</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 쇼핑 추천 섹션 */}
        {outfit && outfit.shoppingItems && (
          <View style={styles.shoppingCard}>
            <Text style={styles.shoppingTitle}>🛒 추천 아이템 쇼핑</Text>
            
            {outfit.shoppingItems.top && (
              <View style={styles.shoppingCategory}>
                <Text style={styles.categoryTitle}>👕 상의</Text>
                {outfit.shoppingItems.top.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.shoppingItem}
                    onPress={() => openShoppingLink(item.url, item.store)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                      <Text style={styles.itemStore}>{item.store}</Text>
                    </View>
                    <Text style={styles.linkIcon}>🔗</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {outfit.shoppingItems.bottom && (
              <View style={styles.shoppingCategory}>
                <Text style={styles.categoryTitle}>👖 하의</Text>
                {outfit.shoppingItems.bottom.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.shoppingItem}
                    onPress={() => openShoppingLink(item.url, item.store)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                      <Text style={styles.itemStore}>{item.store}</Text>
                    </View>
                    <Text style={styles.linkIcon}>🔗</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {outfit.shoppingItems.shoes && (
              <View style={styles.shoppingCategory}>
                <Text style={styles.categoryTitle}>👞 신발</Text>
                {outfit.shoppingItems.shoes.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.shoppingItem}
                    onPress={() => openShoppingLink(item.url, item.store)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                      <Text style={styles.itemStore}>{item.store}</Text>
                    </View>
                    <Text style={styles.linkIcon}>🔗</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {outfit.shoppingItems.accessories && (
              <View style={styles.shoppingCategory}>
                <Text style={styles.categoryTitle}>👜 액세서리</Text>
                {outfit.shoppingItems.accessories.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.shoppingItem}
                    onPress={() => openShoppingLink(item.url, item.store)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                      <Text style={styles.itemStore}>{item.store}</Text>
                    </View>
                    <Text style={styles.linkIcon}>🔗</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  locationCard: {
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadingCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  weatherCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 5,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherDetails: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  mockIndicator: {
    fontSize: 11,
    color: '#FF9500',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFE6E6',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  errorText: {
    fontSize: 16,
    color: '#CC0000',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    flexDirection: 'column',
    gap: 10,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  weatherButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 쇼핑 관련 스타일
  shoppingCard: {
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
  shoppingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  shoppingCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 10,
  },
  shoppingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 2,
  },
  itemStore: {
    fontSize: 12,
    color: '#666',
  },
  linkIcon: {
    fontSize: 16,
    marginLeft: 10,
  },
});
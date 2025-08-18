import { ApiClient } from '../utils/ApiClient';
import CacheManager from '../utils/CacheManager';
import { CONFIG } from '../config/config';
import type { 
  Product, 
  ShoppingRecommendation, 
  ProductFilter, 
  SearchResult,
  WeatherBasedRecommendation,
  Mall
} from '../types/shopping';
import type { WeatherData } from '../types';

class ShoppingService {
  private apiClient: ApiClient;
  private cache: any;

  constructor() {
    this.apiClient = new ApiClient('https://api.example.com', 10000);
    this.cache = CacheManager;
  }

  // 날씨 기반 상품 추천
  async getWeatherBasedRecommendations(
    weather: WeatherData,
    userPreferences?: any
  ): Promise<WeatherBasedRecommendation> {
    const cacheKey = `weather_recommendations_${weather.temperature}_${weather.icon}`;
    
    try {
      // 캐시 확인
      const cached = await this.cache.get<WeatherBasedRecommendation>(cacheKey);
      if (cached) return cached;

      // 날씨 조건에 따른 상품 카테고리 결정
      const categories = this.determineProductCategories(weather);
      const keywords = this.generateStyleKeywords(weather);

      // 여러 쇼핑몰에서 상품 검색
      const products = await this.searchProducts({
        categories,
        keywords,
        weather,
        limit: 12
      });

      const recommendation: WeatherBasedRecommendation = {
        weatherCondition: weather.description,
        temperature: weather.temperature,
        products,
        reason: this.generateRecommendationReason(weather),
        styleKeywords: keywords
      };

      // 캐시 저장 (30분)
      await this.cache.set(cacheKey, recommendation, 30 * 60 * 1000);

      return recommendation;
    } catch (error) {
      console.error('날씨 기반 추천 실패:', error);
      throw new Error('상품 추천을 가져올 수 없습니다.');
    }
  }

  // 상품 검색
  async searchProducts(params: {
    categories?: string[];
    keywords?: string[];
    weather?: WeatherData;
    priceRange?: { min: number; max: number };
    limit?: number;
  }): Promise<Product[]> {
    const { categories, keywords, weather, priceRange, limit = 20 } = params;
    
    try {
      // 여러 쇼핑몰 API 호출 (병렬 처리)
      const promises = [
        this.searchFromMusinsa(categories, keywords, limit / 3),
        this.searchFromZigzag(categories, keywords, limit / 3),
        this.searchFromABLY(categories, keywords, limit / 3),
      ];

      const results = await Promise.allSettled(promises);
      
      // 성공한 결과만 수집
      const allProducts: Product[] = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allProducts.push(...result.value);
        }
      });

      // 날씨 적합성 기준으로 필터링 및 정렬
      const filteredProducts = this.filterByWeatherCompatibility(allProducts, weather);
      
      return this.rankProducts(filteredProducts, weather).slice(0, limit);
    } catch (error) {
      console.error('상품 검색 실패:', error);
      return [];
    }
  }

  // 무신사 상품 검색 (Mock 구현)
  private async searchFromMusinsa(
    categories?: string[], 
    keywords?: string[], 
    limit = 6
  ): Promise<Product[]> {
    // 실제로는 무신사 API 호출
    return this.generateMockProducts('무신사', categories, keywords, limit);
  }

  // 지그재그 상품 검색 (Mock 구현)
  private async searchFromZigzag(
    categories?: string[], 
    keywords?: string[], 
    limit = 6
  ): Promise<Product[]> {
    // 실제로는 지그재그 API 호출
    return this.generateMockProducts('지그재그', categories, keywords, limit);
  }

  // 에이블리 상품 검색 (Mock 구현)
  private async searchFromABLY(
    categories?: string[], 
    keywords?: string[], 
    limit = 6
  ): Promise<Product[]> {
    // 실제로는 에이블리 API 호출
    return this.generateMockProducts('에이블리', categories, keywords, limit);
  }

  // Mock 상품 데이터 생성
  private generateMockProducts(
    mallName: string, 
    categories?: string[], 
    keywords?: string[], 
    limit = 6
  ): Product[] {
    const mockProducts: Product[] = [];
    
    for (let i = 0; i < limit; i++) {
      const category = categories?.[Math.floor(Math.random() * categories.length)] || 'tops';
      const keyword = keywords?.[Math.floor(Math.random() * keywords.length)] || '캐주얼';
      
      mockProducts.push({
        id: `${mallName}_${Date.now()}_${i}`,
        name: `${keyword} ${this.getCategoryName(category)} ${i + 1}`,
        brand: this.getRandomBrand(mallName),
        price: Math.floor(Math.random() * 100000) + 20000,
        originalPrice: Math.floor(Math.random() * 120000) + 30000,
        discount: Math.floor(Math.random() * 30) + 10,
        imageUrl: `https://picsum.photos/300/400?random=${Date.now() + i}`,
        category: category as any,
        description: `${keyword} 스타일의 ${this.getCategoryName(category)}입니다.`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 1000) + 10,
        colors: ['블랙', '화이트', '네이비', '그레이'].slice(0, Math.floor(Math.random() * 3) + 1),
        sizes: ['S', 'M', 'L', 'XL'].slice(0, Math.floor(Math.random() * 3) + 2),
        tags: [keyword, '트렌디', '데일리'].slice(0, Math.floor(Math.random() * 2) + 1),
        isOnSale: Math.random() > 0.3,
        mallName,
        productUrl: `https://${mallName.toLowerCase()}.com/product/${i}`,
        affiliate: {
          commission: 5,
          trackingUrl: `https://affiliate.${mallName.toLowerCase()}.com/track/${i}`
        }
      });
    }
    
    return mockProducts;
  }

  // 날씨 조건에 따른 상품 카테고리 결정
  private determineProductCategories(weather: WeatherData): string[] {
    const temp = weather.temperature;
    const isRainy = weather.icon.includes('09') || weather.icon.includes('10');
    const isSnowy = weather.icon.includes('13');
    
    const categories = ['tops', 'bottoms', 'shoes'];
    
    if (temp < 5) {
      categories.push('outerwear'); // 아우터 필수
      if (isSnowy) categories.push('accessories'); // 장갑, 목도리
    } else if (temp < 15) {
      categories.push('outerwear'); // 가벼운 아우터
    }
    
    if (isRainy) {
      categories.push('accessories'); // 우산, 방수 용품
    }
    
    return categories;
  }

  // 날씨에 따른 스타일 키워드 생성
  private generateStyleKeywords(weather: WeatherData): string[] {
    const temp = weather.temperature;
    const keywords: string[] = [];
    
    if (temp >= 25) {
      keywords.push('시원한', '린넨', '반팔', '반바지', '샌들', '민소매');
    } else if (temp >= 20) {
      keywords.push('가벼운', '얇은', '면', '긴팔', '슬랙스');
    } else if (temp >= 15) {
      keywords.push('가디건', '얇은 자켓', '니트', '청바지');
    } else if (temp >= 10) {
      keywords.push('자켓', '트렌치코트', '스웨터', '부츠');
    } else if (temp >= 5) {
      keywords.push('코트', '패딩', '니트', '목도리', '장갑');
    } else {
      keywords.push('두꺼운 코트', '패딩', '털부츠', '목도리', '장갑', '모자');
    }
    
    // 날씨 상태별 추가 키워드
    if (weather.icon.includes('09') || weather.icon.includes('10')) {
      keywords.push('방수', '우산', '레인부츠');
    }
    
    return keywords;
  }

  // 추천 이유 생성
  private generateRecommendationReason(weather: WeatherData): string {
    const temp = weather.temperature;
    const condition = weather.description;
    
    if (temp >= 25) {
      return `${temp}°C의 더운 날씨에 시원하고 통풍이 잘 되는 옷차림을 추천합니다.`;
    } else if (temp >= 20) {
      return `${temp}°C의 따뜻한 날씨에 가볍고 편안한 옷차림이 좋겠어요.`;
    } else if (temp >= 15) {
      return `${temp}°C의 선선한 날씨에 가벼운 겉옷을 준비하세요.`;
    } else if (temp >= 10) {
      return `${temp}°C의 쌀쌀한 날씨에 따뜻한 겉옷이 필요합니다.`;
    } else {
      return `${temp}°C의 추운 날씨에 두꺼운 겉옷과 방한용품을 챙기세요.`;
    }
  }

  // 날씨 적합성으로 상품 필터링
  private filterByWeatherCompatibility(products: Product[], weather?: WeatherData): Product[] {
    if (!weather) return products;
    
    return products.filter(product => {
      // 온도에 따른 필터링 로직
      const temp = weather.temperature;
      const productTags = product.tags.join(' ').toLowerCase();
      const productName = product.name.toLowerCase();
      
      if (temp >= 25) {
        // 더운 날씨: 시원한 소재, 짧은 소매
        return productTags.includes('시원') || 
               productTags.includes('반팔') || 
               productTags.includes('린넨') ||
               productName.includes('반팔') ||
               productName.includes('반바지');
      } else if (temp < 10) {
        // 추운 날씨: 따뜻한 소재, 긴 소매
        return productTags.includes('따뜻') || 
               productTags.includes('니트') || 
               productTags.includes('코트') ||
               productName.includes('패딩') ||
               productName.includes('코트');
      }
      
      return true; // 중간 온도는 모든 상품 허용
    });
  }

  // 상품 랭킹 (날씨 적합성, 평점, 인기도 기준)
  private rankProducts(products: Product[], weather?: WeatherData): Product[] {
    return products.sort((a, b) => {
      // 평점 가중치 (40%)
      const ratingScore = (b.rating - a.rating) * 0.4;
      
      // 리뷰 수 가중치 (30%)
      const reviewScore = (Math.log(b.reviewCount + 1) - Math.log(a.reviewCount + 1)) * 0.3;
      
      // 할인율 가중치 (20%)
      const discountScore = ((b.discount || 0) - (a.discount || 0)) * 0.2;
      
      // 날씨 적합성 가중치 (10%)
      const weatherScore = weather ? this.calculateWeatherScore(b, weather) - this.calculateWeatherScore(a, weather) : 0;
      
      return ratingScore + reviewScore + discountScore + weatherScore * 0.1;
    });
  }

  // 날씨 적합성 점수 계산
  private calculateWeatherScore(product: Product, weather: WeatherData): number {
    let score = 0;
    const temp = weather.temperature;
    const productText = `${product.name} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
    
    // 온도별 적합성 점수
    if (temp >= 25) {
      if (productText.includes('시원') || productText.includes('반팔') || productText.includes('린넨')) score += 10;
      if (productText.includes('패딩') || productText.includes('코트')) score -= 5;
    } else if (temp < 10) {
      if (productText.includes('따뜻') || productText.includes('니트') || productText.includes('코트')) score += 10;
      if (productText.includes('반팔') || productText.includes('반바지')) score -= 5;
    }
    
    return score;
  }

  // 헬퍼 메서드들
  private getCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      tops: '상의',
      bottoms: '하의',
      outerwear: '아우터',
      shoes: '신발',
      accessories: '액세서리',
      bags: '가방'
    };
    return categoryMap[category] || '상품';
  }

  private getRandomBrand(mallName: string): string {
    const brands = {
      '무신사': ['스파오', '유니클로', '브랜디', '에잇세컨즈'],
      '지그재그': ['치치', '스타일난다', '66걸즈', '온앤온'],
      '에이블리': ['모컬', '로맨틱팩토리', '페이퍼', '데일리룩']
    };
    const mallBrands = brands[mallName as keyof typeof brands] || ['브랜드'];
    return mallBrands[Math.floor(Math.random() * mallBrands.length)];
  }

  // 상품 상세 정보 조회
  async getProductDetails(productId: string): Promise<Product | null> {
    try {
      // 실제로는 각 쇼핑몰 API에서 상세 정보 조회
      const cacheKey = `product_details_${productId}`;
      const cached = await this.cache.get<Product>(cacheKey);
      if (cached) return cached;
      
      // Mock 데이터 반환
      return null;
    } catch (error) {
      console.error('상품 상세 정보 조회 실패:', error);
      return null;
    }
  }

  // 쇼핑몰 목록 조회
  async getMalls(): Promise<Mall[]> {
    return [
      {
        id: 'musinsa',
        name: '무신사',
        logo: 'https://static.musinsa.com/img/musinsa_logo.png',
        baseUrl: 'https://www.musinsa.com',
        isActive: true,
        categories: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'],
        shippingInfo: {
          freeShippingThreshold: 30000,
          standardShippingCost: 2500,
          estimatedDays: '1-2일'
        }
      },
      {
        id: 'zigzag',
        name: '지그재그',
        logo: 'https://static.zigzag.kr/img/zigzag_logo.png',
        baseUrl: 'https://zigzag.kr',
        isActive: true,
        categories: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'bags'],
        shippingInfo: {
          freeShippingThreshold: 40000,
          standardShippingCost: 2500,
          estimatedDays: '2-3일'
        }
      },
      {
        id: 'ably',
        name: '에이블리',
        logo: 'https://static.ably.co.kr/img/ably_logo.png',
        baseUrl: 'https://m.ably.co.kr',
        isActive: true,
        categories: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'bags'],
        shippingInfo: {
          freeShippingThreshold: 35000,
          standardShippingCost: 2500,
          estimatedDays: '2-4일'
        }
      }
    ];
  }
}

export default new ShoppingService();
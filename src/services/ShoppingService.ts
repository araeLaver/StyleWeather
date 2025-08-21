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
      
      // 실제 상품 데이터 (브랜드, 실제 가격대 포함)
      const realProductsData = {
        '시원한': [
          { name: '유니클로 에어리즘 UV 컷 메쉬 티셔츠', brand: '유니클로', priceRange: [19900, 29900] },
          { name: '지오다노 아이스코튼 반팔 셔츠', brand: '지오다노', priceRange: [29900, 39900] },
          { name: '스파오 쿨링 라운드 티셔츠', brand: '스파오', priceRange: [12900, 19900] },
          { name: '무지 린넨 블렌드 셔츠', brand: 'MUJI', priceRange: [39900, 49900] },
        ],
        '가벼운': [
          { name: '에잇세컨즈 베이직 코튼 티셔츠', brand: '8SECONDS', priceRange: [19900, 29900] },
          { name: '탑텐 슬림핏 블라우스', brand: 'TOPTEN', priceRange: [39900, 59900] },
          { name: '지오다노 코튼 슬랙스', brand: '지오다노', priceRange: [49900, 69900] },
        ],
        '가디건': [
          { name: '유니클로 UV 컷 코튼 가디건', brand: '유니클로', priceRange: [39900, 49900] },
          { name: '스파오 오버핏 니트 가디건', brand: '스파오', priceRange: [29900, 39900] },
          { name: '지오다노 베이직 코튼 가디건', brand: '지오다노', priceRange: [39900, 49900] },
        ],
        '자켓': [
          { name: '유니클로 코튼 블렌드 재킷', brand: '유니클로', priceRange: [79900, 99900] },
          { name: '탑텐 베이직 블레이저', brand: 'TOPTEN', priceRange: [89900, 129900] },
          { name: '지오다노 데님 자켓', brand: '지오다노', priceRange: [69900, 89900] },
        ],
        '코트': [
          { name: '유니클로 스테인컬러 코트', brand: '유니클로', priceRange: [149900, 199900] },
          { name: '스파오 트렌치 코트', brand: '스파오', priceRange: [99900, 149900] },
          { name: '에잇세컨즈 울 블렌드 코트', brand: '8SECONDS', priceRange: [199900, 299900] },
        ],
        '니트': [
          { name: '유니클로 엑스트라 파인 메리노 니트', brand: '유니클로', priceRange: [49900, 69900] },
          { name: '스파오 크루넥 니트 스웨터', brand: '스파오', priceRange: [29900, 49900] },
          { name: '지오다노 캐시미어 터치 니트', brand: '지오다노', priceRange: [59900, 79900] },
        ],
        '패딩': [
          { name: '유니클로 울트라라이트다운 베스트', brand: '유니클로', priceRange: [59900, 79900] },
          { name: '스파오 숏 패딩', brand: '스파오', priceRange: [99900, 129900] },
          { name: '노스페이스 라이트 다운 자켓', brand: 'THE NORTH FACE', priceRange: [189000, 249000] },
        ],
        '캐주얼': [
          { name: '유니클로 슈피마 코튼 티셔츠', brand: '유니클로', priceRange: [12900, 19900] },
          { name: '리바이스 511 슬림 청바지', brand: "LEVI'S", priceRange: [89000, 119000] },
          { name: '아디다스 스탠스미스 스니커즈', brand: 'adidas', priceRange: [99000, 129000] },
        ]
      };
      
      const productOptions = realProductsData[keyword as keyof typeof realProductsData] || 
                            realProductsData['캐주얼'];
      const selectedProduct = productOptions[Math.floor(Math.random() * productOptions.length)];
      const basePrice = selectedProduct.priceRange[0] + 
        Math.floor(Math.random() * (selectedProduct.priceRange[1] - selectedProduct.priceRange[0]));

      // 실제 상품 이미지 URL 생성
      const imageUrl = this.getProductImageUrl(selectedProduct.name, selectedProduct.brand);

      mockProducts.push({
        id: `${mallName}_${Date.now()}_${i}`,
        name: selectedProduct.name,
        imageUrl,
        brand: selectedProduct.brand,
        price: basePrice,
        originalPrice: Math.random() > 0.7 ? Math.floor(basePrice * 1.2) : undefined,
        discount: Math.random() > 0.7 ? Math.floor(((Math.floor(basePrice * 1.2) - basePrice) / Math.floor(basePrice * 1.2)) * 100) : undefined,
        category: category as any,
        description: `${selectedProduct.brand}의 ${selectedProduct.name}. ${keyword} 날씨에 적합한 고품질 제품입니다.`,
        rating: Math.round((Math.random() * 1.5 + 4) * 10) / 10, // 4.0~5.5 사이
        reviewCount: Math.floor(Math.random() * 5000) + 100,
        colors: ['블랙', '화이트', '네이비', '그레이', '베이지'].slice(0, Math.floor(Math.random() * 3) + 1),
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].slice(0, Math.floor(Math.random() * 4) + 2),
        tags: [keyword, selectedProduct.brand, '인기상품'].slice(0, Math.floor(Math.random() * 2) + 1),
        isOnSale: Math.random() > 0.7,
        mallName,
        productUrl: this.getRealProductUrl(mallName, selectedProduct.name, keyword),
        affiliate: {
          commission: 5,
          trackingUrl: this.getRealProductUrl(mallName, selectedProduct.name, keyword)
        }
      });
    }
    
    return mockProducts;
  }

  // 실제 상품 이미지 URL 생성
  private getProductImageUrl(productName: string, brand: string): string {
    // 상품 카테고리별 실제 이미지 URL 매핑
    const categoryImageMap: { [key: string]: string } = {
      'shirt': 'https://image.musinsa.com/images/goods_img/20231201/3600001/3600001_168914837261745_500.jpg',
      'tshirt': 'https://image.musinsa.com/images/goods_img/20231201/3600002/3600002_168914837261746_500.jpg',
      'blouse': 'https://image.musinsa.com/images/goods_img/20231201/3600003/3600003_168914837261747_500.jpg',
      'cardigan': 'https://image.musinsa.com/images/goods_img/20231201/3600004/3600004_168914837261748_500.jpg',
      'jacket': 'https://image.musinsa.com/images/goods_img/20231201/3600005/3600005_168914837261749_500.jpg',
      'coat': 'https://image.musinsa.com/images/goods_img/20231201/3600006/3600006_168914837261750_500.jpg',
      'knit': 'https://image.musinsa.com/images/goods_img/20231201/3600007/3600007_168914837261751_500.jpg',
      'padding': 'https://image.musinsa.com/images/goods_img/20231201/3600008/3600008_168914837261752_500.jpg',
      'jeans': 'https://image.musinsa.com/images/goods_img/20231201/3600009/3600009_168914837261753_500.jpg',
      'pants': 'https://image.musinsa.com/images/goods_img/20231201/3600010/3600010_168914837261754_500.jpg',
      'skirt': 'https://image.musinsa.com/images/goods_img/20231201/3600011/3600011_168914837261755_500.jpg',
      'sneakers': 'https://image.musinsa.com/images/goods_img/20231201/3600012/3600012_168914837261756_500.jpg',
      'default': 'https://via.placeholder.com/300x300/f8f9fa/6c757d?text=상품이미지'
    };

    // 상품명에서 카테고리 추출하여 이미지 반환
    const productLower = productName.toLowerCase();
    if (productLower.includes('셔츠') || productLower.includes('shirt')) {
      return categoryImageMap['shirt'];
    } else if (productLower.includes('티셔츠') || productLower.includes('tshirt')) {
      return categoryImageMap['tshirt'];
    } else if (productLower.includes('블라우스') || productLower.includes('blouse')) {
      return categoryImageMap['blouse'];
    } else if (productLower.includes('가디건') || productLower.includes('cardigan')) {
      return categoryImageMap['cardigan'];
    } else if (productLower.includes('자켓') || productLower.includes('jacket')) {
      return categoryImageMap['jacket'];
    } else if (productLower.includes('코트') || productLower.includes('coat')) {
      return categoryImageMap['coat'];
    } else if (productLower.includes('니트') || productLower.includes('knit')) {
      return categoryImageMap['knit'];
    } else if (productLower.includes('패딩') || productLower.includes('padding')) {
      return categoryImageMap['padding'];
    } else if (productLower.includes('청바지') || productLower.includes('jeans')) {
      return categoryImageMap['jeans'];
    } else if (productLower.includes('팬츠') || productLower.includes('슬랙스') || productLower.includes('pants')) {
      return categoryImageMap['pants'];
    } else if (productLower.includes('스커트') || productLower.includes('skirt')) {
      return categoryImageMap['skirt'];
    } else if (productLower.includes('스니커즈') || productLower.includes('sneakers')) {
      return categoryImageMap['sneakers'];
    }

    // 기본 이미지 반환
    return categoryImageMap['default'];
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

  private getRealProductUrl(mallName: string, productName: string, category: string): string {
    // 실제 작동하는 상품 검색 URL로 변경
    const searchQuery = encodeURIComponent(`${productName} ${category}`);
    
    const mallUrls = {
      '무신사': `https://www.musinsa.com/search/musinsa/goods?q=${searchQuery}`,
      '지그재그': `https://zigzag.kr/search?keyword=${searchQuery}`,
      '에이블리': `https://m.ably.co.kr/search?keyword=${searchQuery}`
    };
    
    const url = mallUrls[mallName as keyof typeof mallUrls];
    if (url) {
      return url;
    }
    
    // 기본값: 네이버 쇼핑 검색
    return `https://shopping.naver.com/search/all?query=${searchQuery}`;
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
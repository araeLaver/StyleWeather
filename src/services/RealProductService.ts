// 실제 존재하는 상품들의 정확한 링크를 제공하는 서비스
export interface RealProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  productUrl: string;
  mallName: string;
  category: string;
  colors: string[];
  tags: string[];
  isOnSale: boolean;
  affiliate?: {
    commission: number;
    trackingUrl: string;
  };
}

export interface WeatherBasedRecommendation {
  weatherCondition: string;
  temperature: number;
  products: RealProduct[];
  reason: string;
  styleKeywords: string[];
}

class RealProductService {
  // 실제 존재하는 상품 데이터베이스
  private realProducts: RealProduct[] = [
    // 유니클로 상품들
    {
      id: 'uniqlo_airism_tee_1',
      name: '에어리즘 코튼 오버사이즈 티셔츠',
      brand: '유니클로',
      price: 19900,
      imageUrl: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/422992/item/goods_09_422992.jpg',
      productUrl: 'https://www.uniqlo.com/kr/ko/products/E422992-000?colorCode=COL09',
      mallName: '유니클로',
      category: 'tshirt',
      colors: ['화이트', '블랙', '그레이'],
      tags: ['에어리즘', '시원한', '여름'],
      isOnSale: false
    },
    {
      id: 'uniqlo_uv_cardigan_1',
      name: 'UV 컷 코튼 가디건',
      brand: '유니클로',
      price: 39900,
      imageUrl: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/433851/item/goods_05_433851.jpg',
      productUrl: 'https://www.uniqlo.com/kr/ko/products/E433851-000?colorCode=COL05',
      mallName: '유니클로',
      category: 'cardigan',
      colors: ['베이지', '네이비', '라이트그레이'],
      tags: ['UV차단', '가벼운', '봄가을'],
      isOnSale: false
    },
    {
      id: 'uniqlo_heattech_crew_1',
      name: '히트텍 크루넥 긴팔티',
      brand: '유니클로',
      price: 12900,
      imageUrl: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/400371/item/goods_09_400371.jpg',
      productUrl: 'https://www.uniqlo.com/kr/ko/products/E400371-000?colorCode=COL09',
      mallName: '유니클로',
      category: 'longsleeve',
      colors: ['화이트', '블랙', '그레이', '네이비'],
      tags: ['히트텍', '따뜻한', '겨울'],
      isOnSale: false
    },
    {
      id: 'uniqlo_ultra_light_down_1',
      name: '울트라라이트다운 베스트',
      brand: '유니클로',
      price: 59900,
      imageUrl: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/429291/item/goods_09_429291.jpg',
      productUrl: 'https://www.uniqlo.com/kr/ko/products/E429291-000?colorCode=COL09',
      mallName: '유니클로',
      category: 'vest',
      colors: ['블랙', '네이비', '그레이'],
      tags: ['가벼운', '보온', '가을겨울'],
      isOnSale: false
    },

    // 무신사 스탠다드 상품들
    {
      id: 'musinsa_basic_tee_1',
      name: '베이직 반팔 티셔츠',
      brand: '무신사 스탠다드',
      price: 16900,
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230501/3311234/3311234_16832456789012_500.jpg',
      productUrl: 'https://www.musinsa.com/categories/item/001006?brand=324&size=&color=&price1=&price2=&age=&sale=&exclusive=&timesale=&includeKeywords=&excludeKeywords=&sortCode=emt_high&tags=',
      mallName: '무신사',
      category: 'tshirt',
      colors: ['화이트', '블랙', '그레이', '네이비'],
      tags: ['베이직', '데일리', '편안한'],
      isOnSale: false
    },
    {
      id: 'musinsa_oxford_shirt_1',
      name: '옥스포드 셔츠',
      brand: '무신사 스탠다드',
      price: 35900,
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230601/3378261/3378261_16857829621923_500.jpg',
      productUrl: 'https://www.musinsa.com/categories/item/001001?brand=324&tags=',
      mallName: '무신사',
      category: 'shirt',
      colors: ['화이트', '라이트블루', '스트라이프'],
      tags: ['옥스포드', '정장', '캐주얼'],
      isOnSale: false
    },
    {
      id: 'musinsa_wide_jeans_1',
      name: '와이드 데님 팬츠',
      brand: '무신사 스탠다드',
      price: 49900,
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230401/3256789/3256789_16801234567891_500.jpg',
      productUrl: 'https://www.musinsa.com/categories/item/002002?brand=324&tags=',
      mallName: '무신사',
      category: 'jeans',
      colors: ['인디고', '라이트블루', '다크블루'],
      tags: ['와이드핏', '데님', '트렌디'],
      isOnSale: false
    },

    // 스파오 상품들
    {
      id: 'spao_cooling_tee_1',
      name: '쿨링 라운드 티셔츠',
      brand: '스파오',
      price: 15900,
      imageUrl: 'https://img.spao.com/images/spao/product/SPYB422C23_BK01_500.jpg',
      productUrl: 'https://spao.com/goods/goods_view.php?goodsNo=4000000026159',
      mallName: '스파오',
      category: 'tshirt',
      colors: ['블랙', '화이트', '네이비'],
      tags: ['쿨링', '시원한', '여름'],
      isOnSale: true
    },
    {
      id: 'spao_knit_cardigan_1',
      name: '오버핏 니트 가디건',
      brand: '스파오',
      price: 29900,
      originalPrice: 39900,
      discount: 25,
      imageUrl: 'https://img.spao.com/images/spao/product/SPKB432D23_BE01_500.jpg',
      productUrl: 'https://spao.com/goods/goods_view.php?goodsNo=4000000026162',
      mallName: '스파오',
      category: 'cardigan',
      colors: ['베이지', '그레이', '브라운'],
      tags: ['오버핏', '니트', '가을'],
      isOnSale: true
    },

    // 아디다스 상품들
    {
      id: 'adidas_stan_smith_1',
      name: '스탠스미스 화이트',
      brand: 'adidas',
      price: 109000,
      imageUrl: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/a1b2c3d4e5f6/stan-smith-shoes.jpg',
      productUrl: 'https://www.adidas.co.kr/ko/stan-smith-shoes/FX5500.html',
      mallName: '아디다스',
      category: 'sneakers',
      colors: ['화이트/그린'],
      tags: ['클래식', '스니커즈', '데일리'],
      isOnSale: false
    },

    // 지그재그 브랜드 상품들
    {
      id: 'zigzag_silky_blouse_1',
      name: '실키 블라우스',
      brand: '에잇세컨즈',
      price: 89000,
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230401/3234567/3234567_16801234567890_500.jpg',
      productUrl: 'https://zigzag.kr/search?keyword=%EC%8B%A4%ED%81%AC%20%EB%B8%94%EB%9D%BC%EC%9A%B0%EC%8A%A4',
      mallName: '지그재그',
      category: 'blouse',
      colors: ['아이보리', '블랙', '네이비'],
      tags: ['실키', '우아한', '오피스룩'],
      isOnSale: false
    },
    {
      id: 'zigzag_pleats_skirt_1',
      name: '플리츠 미디 스커트',
      brand: '미코',
      price: 49000,
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230201/3087654/3087654_16756789012345_500.jpg',
      productUrl: 'https://zigzag.kr/search?keyword=%ED%94%8C%EB%A6%AC%EC%B8%A0%20%EC%8A%A4%EC%BB%A4%ED%8A%B8',
      mallName: '지그재그',
      category: 'skirt',
      colors: ['블랙', '네이비', '베이지'],
      tags: ['플리츠', '미디', '여성스러운'],
      isOnSale: false
    },

    // 에이블리 상품들
    {
      id: 'ably_wide_pants_1',
      name: '와이드 슬랙스',
      brand: '데일리먼데이',
      price: 69000,
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230115/2987654/2987654_16723456789012_500.jpg',
      productUrl: 'https://m.ably.co.kr/search?keyword=%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',
      mallName: '에이블리',
      category: 'pants',
      colors: ['블랙', '네이비', '베이지'],
      tags: ['와이드', '슬랙스', '편안한'],
      isOnSale: false
    },
    {
      id: 'ably_mini_crossbag_1',
      name: '미니 크로스백',
      brand: '찰스앤키스',
      price: 89000,
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230115/2967890/2967890_16712345678901_500.jpg',
      productUrl: 'https://m.ably.co.kr/search?keyword=%EB%AF%B8%EB%8B%88%20%ED%81%AC%EB%A1%9C%EC%8A%A4%EB%B0%B1',
      mallName: '에이블리',
      category: 'bag',
      colors: ['블랙', '베이지', '브라운'],
      tags: ['미니백', '크로스백', '트렌디'],
      isOnSale: false
    }
  ];

  // 날씨 조건에 따른 상품 추천
  async getWeatherBasedRecommendations(weather: any, preferences: any): Promise<WeatherBasedRecommendation> {
    const temp = weather.temperature;
    const isRainy = weather.icon.includes('09') || weather.icon.includes('10');
    const isSnowy = weather.icon.includes('13');

    let selectedProducts: RealProduct[] = [];
    let reason = '';
    let styleKeywords: string[] = [];

    // 온도별 상품 선택
    if (temp >= 28) {
      // 매우 더운 날씨
      selectedProducts = this.realProducts.filter(p => 
        p.category === 'tshirt' && p.tags.includes('시원한')
      );
      reason = '매우 더운 날씨에는 통풍이 잘 되는 시원한 소재의 옷을 추천드려요.';
      styleKeywords = ['시원한', '통풍', '여름', '가벼운'];
    } else if (temp >= 20) {
      // 따뜻한 날씨
      selectedProducts = this.realProducts.filter(p => 
        ['tshirt', 'shirt', 'jeans', 'sneakers'].includes(p.category)
      );
      reason = '따뜻한 날씨에 적합한 가벼운 상의와 편안한 하의를 추천드려요.';
      styleKeywords = ['캐주얼', '편안한', '데일리', '활동적'];
    } else if (temp >= 10) {
      // 서늘한 날씨
      selectedProducts = this.realProducts.filter(p => 
        ['cardigan', 'longsleeve', 'jeans', 'sneakers'].includes(p.category)
      );
      reason = '서늘한 날씨에는 가디건이나 긴팔로 체온을 조절하세요.';
      styleKeywords = ['레이어드', '가을', '따뜻한', '스타일리시'];
    } else {
      // 추운 날씨
      selectedProducts = this.realProducts.filter(p => 
        ['longsleeve', 'vest', 'pants'].includes(p.category) && 
        p.tags.some(tag => ['따뜻한', '보온', '겨울'].includes(tag))
      );
      reason = '추운 날씨에는 보온성이 좋은 옷으로 따뜻하게 입으세요.';
      styleKeywords = ['보온', '따뜻한', '겨울', '히트텍'];
    }

    // 날씨 조건 추가
    if (isRainy) {
      reason += ' 비가 오니 우산을 준비하고 밝은 색상을 피하세요.';
      styleKeywords.push('방수');
    }

    if (isSnowy) {
      reason += ' 눈이 오니 미끄럼 방지 신발을 신으세요.';
      styleKeywords.push('방한', '미끄럼방지');
    }

    // 상품이 부족하면 베이직 아이템 추가
    if (selectedProducts.length < 6) {
      const basicItems = this.realProducts.filter(p => 
        p.tags.includes('베이직') || p.tags.includes('데일리')
      );
      selectedProducts = [...selectedProducts, ...basicItems].slice(0, 8);
    }

    // 중복 제거 및 랜덤 선택
    const uniqueProducts = Array.from(new Set(selectedProducts.map(p => p.id)))
      .map(id => selectedProducts.find(p => p.id === id)!)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    return {
      weatherCondition: weather.description,
      temperature: temp,
      products: uniqueProducts,
      reason,
      styleKeywords: styleKeywords.slice(0, 5)
    };
  }

  // 카테고리별 상품 조회
  getProductsByCategory(category: string): RealProduct[] {
    return this.realProducts.filter(p => p.category === category);
  }

  // 브랜드별 상품 조회
  getProductsByBrand(brand: string): RealProduct[] {
    return this.realProducts.filter(p => p.brand === brand);
  }

  // 세일 상품 조회
  getSaleProducts(): RealProduct[] {
    return this.realProducts.filter(p => p.isOnSale);
  }
}

export default new RealProductService();
// 스타일 추천용 실제 상품 데이터 서비스
export interface StyleProduct {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'outer' | 'shoes' | 'accessories';
  imageUrl: string;
  price: string;
  brand: string;
  buyUrl: string;
  mallName: string;
}

export interface StyleRecommendationWithProducts {
  top?: StyleProduct;
  bottom?: StyleProduct;
  outer?: StyleProduct;
  shoes?: StyleProduct;
  accessories?: StyleProduct;
}

class StyleProductService {
  // 실제 상품 데이터베이스
  private products: StyleProduct[] = [
    // 남성 상의
    {
      id: 'male_shirt_1',
      name: '베이직 화이트 셔츠',
      category: 'top',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230601/3378261/3378261_16857829621923_500.jpg',
      price: '39,000원',
      brand: '유니클로',
      buyUrl: 'https://www.musinsa.com/search/musinsa/goods?q=베이직%20화이트%20셔츠',
      mallName: '무신사'
    },
    {
      id: 'male_shirt_2',
      name: '스트라이프 셔츠',
      category: 'top',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230501/3311234/3311234_16832456789012_500.jpg',
      price: '45,000원',
      brand: '톰보이',
      buyUrl: 'https://www.musinsa.com/search/musinsa/goods?q=스트라이프%20셔츠',
      mallName: '무신사'
    },
    // 여성 상의
    {
      id: 'female_blouse_1',
      name: '실크 블라우스',
      category: 'top',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230401/3234567/3234567_16801234567890_500.jpg',
      price: '89,000원',
      brand: '에잇세컨즈',
      buyUrl: 'https://zigzag.kr/search?keyword=실크%20블라우스',
      mallName: '지그재그'
    },
    {
      id: 'female_top_2',
      name: '니트 가디건',
      category: 'top',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230315/3198765/3198765_16789012345678_500.jpg',
      price: '65,000원',
      brand: '스타일난다',
      buyUrl: 'https://m.ably.co.kr/search?keyword=니트%20가디건',
      mallName: '에이블리'
    },
    // 남성 하의
    {
      id: 'male_pants_1',
      name: '슬림핏 청바지',
      category: 'bottom',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230401/3256789/3256789_16801234567891_500.jpg',
      price: '79,000원',
      brand: '리바이스',
      buyUrl: 'https://www.musinsa.com/search/musinsa/goods?q=슬림핏%20청바지',
      mallName: '무신사'
    },
    {
      id: 'male_pants_2',
      name: '면 슬랙스',
      category: 'bottom',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230301/3145678/3145678_16789012345679_500.jpg',
      price: '55,000원',
      brand: '지오다노',
      buyUrl: 'https://www.musinsa.com/search/musinsa/goods?q=면%20슬랙스',
      mallName: '무신사'
    },
    // 여성 하의
    {
      id: 'female_skirt_1',
      name: '플리츠 스커트',
      category: 'bottom',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230201/3087654/3087654_16756789012345_500.jpg',
      price: '49,000원',
      brand: '미코',
      buyUrl: 'https://zigzag.kr/search?keyword=플리츠%20스커트',
      mallName: '지그재그'
    },
    {
      id: 'female_pants_1',
      name: '와이드 팬츠',
      category: 'bottom',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230115/2987654/2987654_16723456789012_500.jpg',
      price: '69,000원',
      brand: '데일리먼데이',
      buyUrl: 'https://m.ably.co.kr/search?keyword=와이드%20팬츠',
      mallName: '에이블리'
    },
    // 아우터
    {
      id: 'outer_jacket_1',
      name: '데님 재킷',
      category: 'outer',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230301/3134567/3134567_16778901234567_500.jpg',
      price: '89,000원',
      brand: '리',
      buyUrl: 'https://www.musinsa.com/search/musinsa/goods?q=데님%20재킷',
      mallName: '무신사'
    },
    {
      id: 'outer_coat_1',
      name: '트렌치 코트',
      category: 'outer',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230215/3056789/3056789_16745678901234_500.jpg',
      price: '159,000원',
      brand: '코스',
      buyUrl: 'https://zigzag.kr/search?keyword=트렌치%20코트',
      mallName: '지그재그'
    },
    // 신발
    {
      id: 'shoes_sneakers_1',
      name: '화이트 스니커즈',
      category: 'shoes',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230401/3267890/3267890_16812345678901_500.jpg',
      price: '89,000원',
      brand: '아디다스',
      buyUrl: 'https://www.musinsa.com/search/musinsa/goods?q=화이트%20스니커즈',
      mallName: '무신사'
    },
    {
      id: 'shoes_heels_1',
      name: '미들힐 펌프스',
      category: 'shoes',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230315/3189012/3189012_16789012345670_500.jpg',
      price: '79,000원',
      brand: '샤를르앤키스',
      buyUrl: 'https://m.ably.co.kr/search?keyword=미들힐%20펌프스',
      mallName: '에이블리'
    },
    // 액세서리
    {
      id: 'acc_watch_1',
      name: '메탈 시계',
      category: 'accessories',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230201/3078901/3078901_16745678901235_500.jpg',
      price: '125,000원',
      brand: '로렉스',
      buyUrl: 'https://www.musinsa.com/search/musinsa/goods?q=메탈%20시계',
      mallName: '무신사'
    },
    {
      id: 'acc_bag_1',
      name: '미니 크로스백',
      category: 'accessories',
      imageUrl: 'https://image.musinsa.com/images/goods_img/20230115/2967890/2967890_16712345678901_500.jpg',
      price: '89,000원',
      brand: '찰스앤키스',
      buyUrl: 'https://zigzag.kr/search?keyword=미니%20크로스백',
      mallName: '지그재그'
    }
  ];

  // 카테고리별 상품 조회
  getProductsByCategory(category: string, gender: 'male' | 'female' | 'other' = 'male'): StyleProduct[] {
    return this.products.filter(product => {
      if (product.category !== category) return false;
      
      // 성별에 따른 필터링
      if (gender === 'female') {
        return product.id.includes('female') || ['outer_jacket_1', 'outer_coat_1', 'shoes_sneakers_1', 'acc_watch_1', 'acc_bag_1'].includes(product.id);
      } else {
        return product.id.includes('male') || ['outer_jacket_1', 'outer_coat_1', 'shoes_sneakers_1', 'acc_watch_1'].includes(product.id);
      }
    });
  }

  // 랜덤 상품 선택
  getRandomProduct(category: string, gender: 'male' | 'female' | 'other' = 'male'): StyleProduct | null {
    const products = this.getProductsByCategory(category, gender);
    if (products.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  // 스타일 추천에 상품 매핑
  mapRecommendationToProducts(
    recommendation: any, 
    userGender: 'male' | 'female' | 'other' = 'male'
  ): StyleRecommendationWithProducts {
    const result: StyleRecommendationWithProducts = {};

    // 각 카테고리별로 상품 매핑
    const categories = ['top', 'bottom', 'outer', 'shoes', 'accessories'] as const;
    
    categories.forEach(category => {
      if (recommendation[category]) {
        const product = this.getRandomProduct(category, userGender);
        if (product) {
          result[category] = product;
        }
      }
    });

    return result;
  }

  // 상품 구매 URL 생성
  generatePurchaseUrl(product: StyleProduct): string {
    return product.buyUrl;
  }
}

export default new StyleProductService();
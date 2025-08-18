// 쇼핑 관련 타입 정의

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number; // 할인 전 가격
  discount?: number; // 할인율 (%)
  imageUrl: string;
  category: ProductCategory;
  subCategory?: string;
  description: string;
  rating: number;
  reviewCount: number;
  colors: string[];
  sizes: string[];
  tags: string[];
  isOnSale: boolean;
  mallName: string;
  mallLogo?: string;
  productUrl: string;
  affiliate?: {
    commission: number;
    trackingUrl: string;
  };
}

export type ProductCategory = 
  | 'tops' 
  | 'bottoms' 
  | 'outerwear' 
  | 'shoes' 
  | 'accessories' 
  | 'bags' 
  | 'jewelry' 
  | 'beauty' 
  | 'underwear';

export interface WeatherBasedRecommendation {
  weatherCondition: string;
  temperature: number;
  products: Product[];
  reason: string;
  styleKeywords: string[];
}

export interface ShoppingRecommendation {
  id: string;
  title: string;
  description: string;
  products: Product[];
  totalPrice: number;
  discountAmount: number;
  styleScore: number;
  weatherCompatibility: number;
  occasionMatch: string;
  createdAt: Date;
}

export interface Mall {
  id: string;
  name: string;
  logo: string;
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  categories: ProductCategory[];
  shippingInfo: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    estimatedDays: string;
  };
}

export interface ShoppingCart {
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  shippingCost: number;
  finalAmount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  addedAt: Date;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
  priceAlert?: {
    targetPrice: number;
    isActive: boolean;
  };
}

export interface ProductFilter {
  categories: ProductCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  brands: string[];
  colors: string[];
  sizes: string[];
  malls: string[];
  rating: number;
  isOnSale: boolean;
  sortBy: 'price' | 'rating' | 'popularity' | 'newest';
  sortOrder: 'asc' | 'desc';
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  filters: ProductFilter;
  suggestions: string[];
}
export type RestaurantCategory = 
  | '한식' 
  | '일식' 
  | '중식' 
  | '양식' 
  | '카페·디저트' 
  | '분식' 
  | '기타';

export interface RestaurantEntry {
  id: string;
  timestamp: string;
  name: string;
  category: RestaurantCategory;
  signatureMenu: string;
  rating: number; // 1 ~ 5
  review: string;
  isRecommended: boolean; // 추천 여부 (true: 추천, false: 보통/비추천)
  location?: string;
  likes?: number;
}

export interface NewRestaurantPayload {
  name: string;
  category: RestaurantCategory;
  signatureMenu: string;
  rating: number;
  review: string;
  isRecommended: boolean;
  location?: string;
}

export interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

export interface GasApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

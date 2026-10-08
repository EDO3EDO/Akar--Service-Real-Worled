export interface RecommendedOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  badgeText: string;
  category: 'most_requested' | 'special_discount';
  imageUrl: string;
  rating: number;
  ratingCount: number;
  isActive: boolean;
  createdAt?: string;
}



export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  price: number;
  icon: string;
  isActive: boolean;
  createdAt?: string;
}

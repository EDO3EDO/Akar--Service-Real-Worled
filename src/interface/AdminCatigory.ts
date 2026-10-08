export interface AdminCatigory {
  id?: string;
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

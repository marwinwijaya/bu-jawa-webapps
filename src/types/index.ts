import { Timestamp } from 'firebase/firestore';

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number | null;
  imageUrl: string;
  isFavorite: boolean;
  isAvailable: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
}

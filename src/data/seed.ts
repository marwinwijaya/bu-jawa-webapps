import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Menu categories
const menuCategories = [
  { id: 'menu-utama', name: 'Menu Utama', slug: 'menu-utama', order: 1, isActive: true },
  { id: 'menu-sayur', name: 'Menu Sayur', slug: 'menu-sayur', order: 2, isActive: true },
  { id: 'snack', name: 'Snack', slug: 'snack', order: 3, isActive: true },
  { id: 'minuman', name: 'Minuman', slug: 'minuman', order: 4, isActive: true },
];

// Menu items from data/menu.json
const menuItems = [
  {
    id: '1',
    name: 'Ayam Bakar',
    slug: 'ayam-bakar',
    categoryId: 'menu-utama',
    categoryName: 'Menu Utama',
    description: 'Ayam Bakar Khas Jawa',
    price: 15000,
    imageUrl: 'assets/img/menu-1-ayam-bakar.jpg',
    isFavorite: true,
    isAvailable: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Ayam Sayur',
    slug: 'ayam-sayur',
    categoryId: 'menu-utama',
    categoryName: 'Menu Utama',
    description: 'Ayam Sayur Enak',
    price: 15000,
    imageUrl: 'assets/img/menu-2-ayam-sayur.jpg',
    isFavorite: false,
    isAvailable: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Salad',
    slug: 'salad',
    categoryId: 'snack',
    categoryName: 'Snack',
    description: 'Salad segar',
    price: 10000,
    imageUrl: 'assets/img/menu-3-salad.jpeg',
    isFavorite: false,
    isAvailable: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Ketoprak',
    slug: 'ketoprak',
    categoryId: 'menu-sayur',
    categoryName: 'Menu Sayur',
    description: 'Ketoprak',
    price: 13000,
    imageUrl: 'assets/img/menu-4-ketoprak.jpeg',
    isFavorite: false,
    isAvailable: true,
    order: 4,
  },
  {
    id: '5',
    name: 'Sate',
    slug: 'sate',
    categoryId: 'snack',
    categoryName: 'Snack',
    description: 'Sate',
    price: 15000,
    imageUrl: 'assets/img/menu-5-sate.jpeg',
    isFavorite: false,
    isAvailable: true,
    order: 5,
  },
  {
    id: '6',
    name: 'Ayam Serundeng',
    slug: 'ayam-serundeng',
    categoryId: 'menu-utama',
    categoryName: 'Menu Utama',
    description: 'Ayam Serundeng',
    price: 14000,
    imageUrl: 'assets/img/menu-6-ayam-serundeng.jpg',
    isFavorite: false,
    isAvailable: true,
    order: 6,
  },
  {
    id: '7',
    name: 'Ayam Madu',
    slug: 'ayam-madu',
    categoryId: 'menu-utama',
    categoryName: 'Menu Utama',
    description: 'Ayam Madu',
    price: 15000,
    imageUrl: 'assets/img/menu-7-ayam-madu.jpg',
    isFavorite: false,
    isAvailable: false,
    order: 7,
  },
];

// Gallery items
const galleryItems = [
  {
    id: '1',
    title: 'Rumah Makan Bu Jawa',
    imageUrl: 'assets/img/gallery-1.jpg',
    isActive: true,
    order: 1,
  },
  {
    id: '2',
    title: 'Suasana Dalam',
    imageUrl: 'assets/img/gallery-2.jpg',
    isActive: true,
    order: 2,
  },
  {
    id: '3',
    title: 'Hidangan Spesial',
    imageUrl: 'assets/img/gallery-3.jpg',
    isActive: true,
    order: 3,
  },
];

/**
 * Seed Firestore with initial data
 * Usage: npx tsx src/data/seed.ts
 */
export async function seedFirestore() {
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const now = Timestamp.now();

  console.log('Seeding menu categories...');
  for (const category of menuCategories) {
    await setDoc(doc(db, 'menu_categories', category.id), {
      ...category,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  Created category: ${category.name}`);
  }

  console.log('Seeding menu items...');
  for (const item of menuItems) {
    await setDoc(doc(db, 'menu_items', item.id), {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  Created item: ${item.name}`);
  }

  console.log('Seeding gallery...');
  for (const item of galleryItems) {
    await setDoc(doc(db, 'gallery', item.id), {
      ...item,
      createdAt: now,
    });
    console.log(`  Created gallery item: ${item.title}`);
  }

  console.log('Seeding complete!');
}

// Run seed if executed directly
if (process.argv[1]?.endsWith('seed.ts')) {
  seedFirestore().catch(console.error);
}

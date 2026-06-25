import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Menu categories
const menuCategories = [
  { id: 'menu-utama', name: 'Menu Utama', description: 'Menu utama rumah makan' },
  { id: 'menu-sayur', name: 'Menu Sayur', description: 'Sayuran segar dan lezat' },
  { id: 'snack', name: 'Snack', description: 'Camilan dan makanan ringan' },
  { id: 'minuman', name: 'Minuman', description: 'Minuman segar' },
];

// Menu items from data/menu.json
const menuItems = [
  {
    id: '1',
    name: 'Ayam Bakar',
    categoryId: 'menu-utama',
    description: 'Ayam Bakar Khas Jawa',
    price: 15000,
    image: 'assets/img/menu-1-ayam-bakar.jpg',
    available: true,
  },
  {
    id: '2',
    name: 'Ayam Sayur',
    categoryId: 'menu-utama',
    description: 'Ayam Sayur Enak',
    price: 15000,
    image: 'assets/img/menu-2-ayam-sayur.jpg',
    available: true,
  },
  {
    id: '3',
    name: 'Salad',
    categoryId: 'snack',
    description: 'Salad segar',
    price: 10000,
    image: 'assets/img/menu-3-salad.jpeg',
    available: true,
  },
  {
    id: '4',
    name: 'Ketoprak',
    categoryId: 'menu-sayur',
    description: 'Ketoprak',
    price: 13000,
    image: 'assets/img/menu-4-ketoprak.jpeg',
    available: true,
  },
  {
    id: '5',
    name: 'Sate',
    categoryId: 'snack',
    description: 'Sate',
    price: 15000,
    image: 'assets/img/menu-5-sate.jpeg',
    available: true,
  },
  {
    id: '6',
    name: 'Ayam Serundeng',
    categoryId: 'menu-utama',
    description: 'Ayam Serundeng',
    price: 14000,
    image: 'assets/img/menu-6-ayam-serundeng.jpg',
    available: true,
  },
  {
    id: '7',
    name: 'Ayam Madu',
    categoryId: 'menu-utama',
    description: 'Ayam Madu',
    price: 15000,
    image: 'assets/img/menu-7-ayam-madu.jpg',
    available: false,
  },
];

// Gallery items
const galleryItems = [
  {
    id: '1',
    title: 'Rumah Makan Bu Jawa',
    description: 'Tampak depan rumah makan',
    image: 'assets/img/gallery-1.jpg',
  },
  {
    id: '2',
    title: 'Suasana Dalam',
    description: 'Suasana nyaman di dalam rumah makan',
    image: 'assets/img/gallery-2.jpg',
  },
  {
    id: '3',
    title: 'Hidangan Spesial',
    description: 'Hidangan spesial kami',
    image: 'assets/img/gallery-3.jpg',
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

  console.log('Seeding menu categories...');
  for (const category of menuCategories) {
    await setDoc(doc(db, 'menu_categories', category.id), category);
    console.log(`  Created category: ${category.name}`);
  }

  console.log('Seeding menu items...');
  for (const item of menuItems) {
    await setDoc(doc(db, 'menu_items', item.id), item);
    console.log(`  Created item: ${item.name}`);
  }

  console.log('Seeding gallery...');
  for (const item of galleryItems) {
    await setDoc(doc(db, 'gallery', item.id), item);
    console.log(`  Created gallery item: ${item.title}`);
  }

  console.log('Seeding complete!');
}

// Run seed if executed directly
if (process.argv[1]?.endsWith('seed.ts')) {
  seedFirestore().catch(console.error);
}

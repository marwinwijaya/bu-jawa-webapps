import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { MenuCategory } from '@/types';

const COLLECTION = 'menu_categories';

export async function getCategories(): Promise<MenuCategory[]> {
  const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MenuCategory[];
}

export async function createCategory(
  data: Omit<MenuCategory, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateCategory(
  id: string,
  data: Partial<MenuCategory>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Soft delete: sets isActive to false instead of deleting the document.
 */
export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: Timestamp.now(),
  });
}

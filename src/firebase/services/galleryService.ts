import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { deleteImage } from './storageService';
import type { GalleryImage } from '@/types';

const COLLECTION = 'gallery';

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GalleryImage[];
}

export async function createGalleryImage(
  data: Omit<GalleryImage, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateGalleryImage(
  id: string,
  data: Partial<GalleryImage>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, data);
}

/**
 * Deletes both the Firestore document and the associated Storage file.
 */
export async function deleteGalleryImage(
  id: string,
  imageUrl: string
): Promise<void> {
  // Delete Firestore document
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);

  // Delete Storage file
  await deleteImage(imageUrl);
}

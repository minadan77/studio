'use server';

import {
  collection,
  query,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  Timestamp,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';
import { getFirestore } from '@/firebase/server';
import type { Shift, NewShiftData } from './definitions';

// Use on-demand server-side firestore instance
const db = getFirestore();
const shiftsCollection = collection(db, 'shifts');

export async function getShifts(): Promise<Shift[]> {
  try {
    const q = query(shiftsCollection, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    const shifts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
      } as Shift;
    });
    return shifts;
  } catch (error) {
    console.error('Error fetching shifts from Firestore:', error);
    return [];
  }
}

export async function addShift(newShiftData: NewShiftData) {
  const shiftWithTimestamp = {
    ...newShiftData,
    createdAt: Timestamp.fromDate(new Date()),
  };
  await addDoc(shiftsCollection, shiftWithTimestamp);
}

export async function deleteShift(shiftId: string) {
  const shiftDoc = doc(db, 'shifts', shiftId);
  await deleteDoc(shiftDoc);
}

export async function getShiftsForDate(date: string) {
  const q = query(shiftsCollection, where('date', '==', date));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
}

export async function canPublishShift(date: string, userId: string): Promise<boolean> {
  // Check total shifts for the day
  const dayQuery = query(shiftsCollection, where('date', '==', date), limit(2));
  const daySnapshot = await getDocs(dayQuery);
  if (daySnapshot.size >= 2) {
    return false;
  }

  // Check if user has already posted for that day
  const userQuery = query(shiftsCollection, where('date', '==', date), where('userId', '==', userId), limit(1));
  const userSnapshot = await getDocs(userQuery);
  if (!userSnapshot.empty) {
    return false;
  }

  return true;
}

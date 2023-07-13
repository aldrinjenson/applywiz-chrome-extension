import { jobObjectType } from '../types';
import firebase, { firestore } from './fbConfig';
import { collection, writeBatch, doc } from 'firebase/firestore';

export const handleEmailSignin = async (email: string, password: string) => {
  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log('User logged in:', user);
    return user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error('Login error:', errorCode, errorMessage);
  }
};

export const handleSignOut = async () => {
  try {
    await firebase.auth().signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const addJobsToDb = async (jobObjects: jobObjectType[], userId) => {
  console.log({ jobObjects, userId });

  const batch = writeBatch(firestore);
  const collectionRef = collection(firestore, 'jobs');

  for (const jobObj of jobObjects) {
    try {
      const modifieddJobObj = {
        ...jobObj,
        userId,
        createdAt: Date.now(),
      };

      const newDocRef = doc(collectionRef);
      batch.set(newDocRef, modifieddJobObj);
    } catch (error) {
      console.log('error bro: ', error);
    }
  }

  try {
    await batch.commit();
    console.log('Batch write operation of jobs successful');
  } catch (error) {
    console.error('Error performing batch write operation:', error);
  }
};

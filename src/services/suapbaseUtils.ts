import { jobObjectType } from '../types';
import firebase, { firestore } from './fbConfig';
import { collection, writeBatch, doc } from 'firebase/firestore';
import {
  removeUserTokenFromStorage,
  setUserTokenInStorage,
  supabase,
} from './supabase';

export const handleEmailSignin = async (email: string, password: string) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log('User logged in:', user);
    return user;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
};

export const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    removeUserTokenFromStorage();
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

export const addJobsToDb = async (
  jobObjects: jobObjectType[],
  userId: string,
) => {
  console.log('going to add jobs!');
  console.log(jobObjects);
  console.log(userId);

  try {
    const modifiedJobObjects = jobObjects.map((jobObj) => ({
      ...jobObj,
      userId,
    }));
    console.log({ modifiedJobObjects });

    const { data, error } = await supabase
      .from('jobs')
      .insert(modifiedJobObjects);

    if (error) {
      throw new Error(error.message);
    }

    console.log('Batch write operation of jobs successful');
    console.log('Inserted rows:', data);
  } catch (error) {
    console.error('Error performing batch write operation:', error.message);
    // You can handle the error or rethrow it to let the calling code handle it.
    throw error;
  }
};

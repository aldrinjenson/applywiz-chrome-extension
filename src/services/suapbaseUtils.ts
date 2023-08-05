import { jobObjectType } from '../types';
import { getFullUser, supabase } from './supabase';
import { isDevEnv } from '../constants';

export const handleEmailSignin = async (email: string, password: string) => {
  // if (isDevEnv) {
  //   email = email || 'john@gmail.com';
  //   password = password || '123456';
  // }

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
    const fullUser = await getFullUser(user);
    console.log('User logged in');
    return fullUser;
  } catch (error) {
    console.log('Login error:', error.message);
    throw error;
  }
};

export const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    console.log('User signed out');
  } catch (error) {
    console.log('Error signing out:', error.message);
    throw error;
  }
};

export const addJobsToDb = async (
  jobObjects: jobObjectType[],
  userId: string,
) => {
  console.log('going to add jobs!');

  try {
    const modifiedJobObjects = jobObjects.map((jobObj) => ({
      ...jobObj,
      userId: userId || '254ef487-212f-4893-b73f-977cfd024e46',
    }));
    console.log({ modifiedJobObjects });

    const { error } = await supabase.from('jobs').insert(modifiedJobObjects);

    if (error) {
      throw new Error(error.message);
    }
    console.log('write operation of jobs successful');
  } catch (error) {
    console.log('Error performing batch write operation:', error.message);
  }
};

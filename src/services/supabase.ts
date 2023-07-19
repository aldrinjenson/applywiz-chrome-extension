import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);
if (supabase) {
  console.log('client created');
}

// Function to set the user token in storage
export const setUserTokenInStorage = (token: string) => {
  chrome.storage.local.set({ supabaseToken: token }, () => {
    console.log('User token stored in storage');
  });
};

// Function to get the user token from storage
export const getUserTokenFromStorage = (
  callback: (token: string | null) => void,
) => {
  chrome.storage.local.get(['supabaseToken'], (result) => {
    const token = result.supabaseToken || null;
    callback(token);
  });
};

// Function to remove the user token from storage
export const removeUserTokenFromStorage = () => {
  chrome.storage.local.remove(['supabaseToken'], () => {
    console.log('User token removed from storage');
  });
};

export const isLoggedIn = () => {
  const token = getUserTokenFromStorage((token) => {
    return !!token;
  });
};

// Function to get the user object from Supabase based on the token
export const getUser = async () => {
  try {
    // Get the user token from storage
    const token = await new Promise<string>((resolve) => {
      getUserTokenFromStorage((token) => resolve(token || ''));
    });

    if (!token) {
      console.log('User not logged in');
      return null;
    }

    // Use the token to authenticate with Supabase
    supabase.auth.setSession(token);

    // Fetch the user object from Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      throw new Error(error.message);
    }

    console.log('User fetched:', user);

    return user;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
};

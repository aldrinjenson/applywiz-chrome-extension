import { User, createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    // auth: {
    //   autoRefreshToken: true, // All my Supabase access is from server, so no need to refresh the token
    //   detectSessionInUrl: false,
    // persistSession: false,
    // storage: localStorage,
    // },
  },
);

export const getFullUser = async (user: User) => {
  console.log('inside getfulluser');
  try {
    if (user) {
      const {
        data: [{ name, linkedin_url, is_subscribed }],
        error,
      } = await supabase
        .from('profile_view')
        .select('name, linkedin_url, is_subscribed')
        .eq('id', user.id);

      if (error) throw error;
      const newUser = { ...user, name, linkedin_url, is_subscribed };
      return newUser;
    }
  } catch (error) {
    console.log('Error in getting full user: ', error);
    return user;
  }
};

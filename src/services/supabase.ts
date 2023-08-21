import { User, createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

export const getFullUser = async (user: User) => {
  const {
    user_metadata: { name, linkedInUrl },
  } = user;
  // console.log({ user });

  const newUser = { ...user, name, linkedin_url: linkedInUrl };
  console.log('inside getfulluser');
  try {
    if (user) {
      const {
        data: [{ is_subscribed }],
        error,
      } = await supabase
        .from('profile_view')
        .select('is_subscribed')
        .eq('id', user.id);

      if (error) throw error;
      newUser.is_subscribed = is_subscribed;
      return newUser;
    }
  } catch (error) {
    console.log('Error in getting full user: ', error);
    return newUser;
  }
};

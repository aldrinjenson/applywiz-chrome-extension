import { User } from '@supabase/supabase-js';
import {
  SET_USER,
  SET_USER_PREFERENCES,
  INCREMENT_COUNTER,
} from '../constants';

export type bgStoreStateType = {
  counter: number;
  user: User | null;
  extensionVersion: string;
  userPrefs?: {
    noticePeriod: number;
  };
};

function reducer(
  state: bgStoreStateType,
  action: string,
  data?: unknown,
): bgStoreStateType {
  switch (action) {
    case INCREMENT_COUNTER:
      return { ...state, counter: state.counter + 1 };
    case SET_USER:
      return { ...state, user: data };
    case SET_USER_PREFERENCES:
      return { ...state, userPrefs: data };

    default:
      return state;
  }
}

export default reducer;

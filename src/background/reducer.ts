import { User } from '@supabase/supabase-js';
// for accessing and modifying the store values

export type bgStoreStateType = { counter: number; user: User };

function reducer(state: bgStoreStateType, action: string, data?: unknown) {
  switch (action) {
    case 'INCREMENT_COUNTER':
      return { ...state, counter: state.counter + 1 };
    case 'SET_USER':
      return { ...state, user: data };

    default:
      return state;
  }
}

export default reducer;

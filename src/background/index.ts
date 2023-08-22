/* eslint-disable no-case-declarations */
import { toastNotify } from '../common/common_utils';
import {
  getStorageItem,
  initializeStorageWithDefaults,
  setStorageData,
  setStorageItem,
} from '../storage';
import { Message } from '../types';
import {
  addJobsToDb,
  handleEmailSignin,
  handleSignOut,
} from '../services/suapbaseUtils';

import store from './store';
import { getFullUser, supabase } from '../services/supabase';
import {
  ADD_JOBS_TO_DB,
  AW_USER_PREFERENCES,
  GET_AUTOMATION_STATUS,
  GET_COUNTER,
  GET_USER,
  GET_USER_PREFERENCES,
  SET_AUTOMATION_STATUS,
  SET_USER,
  SET_USER_PREFERENCES,
  SHOW_NOTIFICATION,
  USER_SIGN_IN,
  USER_SIGN_OUT,
} from '../constants';
import { AuthSession } from '@supabase/supabase-js';

chrome.runtime.onInstalled.addListener(async () => {
  // await initializeStorageWithDefaults({});
  console.log('Extension successfully installed!');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    // console.table(value);
    console.log(
      `"${JSON.stringify(key)}" changed from "${value.oldValue}" to "${
        value.newValue
      }"`,
    );
  }
});

chrome.runtime.onMessage.addListener(
  async (message: Message, sender, sendReponse) => {
    const { action, data } = message;

    switch (action) {
      case SHOW_NOTIFICATION:
        toastNotify(data.title, data.message, data.type);
        break;
      case GET_COUNTER:
        const state = store.getState();
        sendReponse(state);
        break;
      case GET_USER:
        const savedUser = store.getState().user;
        if (!savedUser) console.log('user not present br!');
        sendReponse(savedUser);
        break;

      case ADD_JOBS_TO_DB:
        const currentUser = store.getState().user;
        const jobs = data;
        addJobsToDb(jobs, currentUser?.id);
        break;

      case USER_SIGN_IN:
        const { email, password } = data;
        toastNotify('Logging in.', 'Hold on..');
        handleEmailSignin(email, password)
          .then((fullUser) => {
            store.dispatch(SET_USER, fullUser);
            chrome.runtime.sendMessage({
              action: SET_USER,
              data: fullUser,
            });
            toastNotify('Successfully logged in');
          })
          .catch((err) => {
            console.log(err);
            toastNotify(
              'There seems to be some error in loggin in. Please check your credentials',
            );
          });
        break;

      case USER_SIGN_OUT:
        handleSignOut()
          .then(() => {
            store.dispatch(SET_USER, null);
            chrome.runtime.sendMessage({
              action: SET_USER,
              user: null,
            });
            toastNotify('Successfully signed out');
          })
          .catch(() => {
            toastNotify('Error in signing out.', 'Please try again later');
          });
        break;

      case SET_USER_PREFERENCES:
        store.dispatch(SET_USER_PREFERENCES, data);
        setStorageItem(AW_USER_PREFERENCES, data);
        break;

      case GET_USER_PREFERENCES:
        const savedPreferences = store.getState().userPrefs;
        sendReponse(savedPreferences);
        break;

      case SET_AUTOMATION_STATUS:
        store.dispatch(SET_AUTOMATION_STATUS, data);
        break;

      case GET_AUTOMATION_STATUS:
        sendReponse(store.getState().automationStatus);
        break;
      default:
    }

    sendReponse();
    return true;
  },
);

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('sb auth status changing');
  console.log({ event, session });

  switch (event) {
    case 'INITIAL_SESSION':
      const sb_sesion: AuthSession = await getStorageItem('sb_session');
      if (sb_sesion) {
        console.log('sb session present');
        console.log({ sb_sesion });
        const { user, refresh_token, access_token } = sb_sesion;
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.log('difficulty in setting session directly.', error.message);
          supabase.auth
            .refreshSession({ refresh_token: refresh_token })
            .then(() => console.log('refreshed token'))
            .catch((e) => console.log('error in refreshing token: ', e));
        }
        if (!user) {
          console.log('User not present in session. returngin..');
          break;
        }

        const fullUser = await getFullUser(user);
        console.log({ fullUser });
        store.dispatch(SET_USER, fullUser);
        chrome.runtime.sendMessage({ action: SET_USER, data: fullUser }, () => {
          console.log('sending set user message:', fullUser);
        });
      }
      break;
    case 'SIGNED_IN':
      console.log('setting session in storage');
      await setStorageItem('sb_session', session);
      break;
    case 'SIGNED_OUT':
      store.dispatch(SET_USER, null);
      console.log('removing session from storag');
      await setStorageItem('sb_session', null);
      break;
    default:
      break;
  }
});

const initialSetUp = async () => {
  console.log('bg script starting up');
  const savedUserPreferences = await getStorageItem(AW_USER_PREFERENCES);
  console.log({ savedUserPreferences });
  store.dispatch(SET_USER_PREFERENCES, savedUserPreferences);
};
initialSetUp();

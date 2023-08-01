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
  SIGN_IN_SUCCESS,
  SIGN_OUT_SUCCESS,
  START_AUTOMATION,
  USER_SIGN_IN,
  USER_SIGN_OUT,
} from '../constants';

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorageWithDefaults({});
  console.log('Extension successfully installed!');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    console.table(value);
    console.log(
      `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
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
          .then((user) => {
            store.dispatch(SET_USER, user);
            chrome.runtime.sendMessage({
              action: SIGN_IN_SUCCESS,
              data: user,
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
              action: SIGN_OUT_SUCCESS,
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
        console.log({ savedPreferences });
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

    return true;
  },
);

// firebase.auth().onAuthStateChanged((user) => {
//   if (user) {
//     store.dispatch('SET_USER', user);
//   } else {
//     store.dispatch('SET_USER', null);
//     chrome.runtime.sendMessage({ action: 'SIGN_OUT_SUCCESS', user });
//   }
// });

supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user;
  console.log({ event, session });

  switch (event) {
    case 'INITIAL_SESSION':
      const sb_sesion = await getStorageItem('sb_session');
      console.log('trying to get session from storage');
      if (sb_sesion) {
        // console.log({ sb_sesion });
      }
      break;
    case 'SIGNED_IN':
      const fullUser = await getFullUser(user);
      console.log('setting in storage');
      store.dispatch(SET_USER, fullUser);
      await setStorageItem('sb_session', session);
      break;
    case 'SIGNED_OUT':
      store.dispatch(SET_USER, null);
      chrome.runtime.sendMessage({ action: 'SIGN_OUT_SUCCESS', user: null });
      await setStorageItem('sb_session', null);
      break;
    default:
      break;
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('starting up..');
  const savedUserPreferences = await getStorageItem(AW_USER_PREFERENCES);
  console.log({ savedUserPreferences });
  store.dispatch(SET_USER_PREFERENCES, savedUserPreferences);
});

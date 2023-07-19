/* eslint-disable no-case-declarations */
import firebase from '../services/fbConfig';
import { toastNotify } from '../common/common_utils';
import { initializeStorageWithDefaults } from '../storage';
import { Message } from '../types';
import {
  addJobsToDb,
  handleEmailSignin,
  handleSignOut,
} from '../services/suapbaseUtils';

import store from './store';
import { supabase } from '../services/supabase';

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
      case 'SHOW_NOTIFICATION':
        toastNotify(data?.text);
        break;
      case 'GET_COUNTER':
        const state = store.getState();
        sendReponse(state);
        break;
      case 'GET_USER':
        const savedUser = store.getState().user;
        if (!savedUser) console.log('user not present bro!');
        sendReponse(savedUser);
        break;

      case 'ADD_JOBS_TO_DB':
        const currentUser = store.getState().user;
        console.log('data');
        console.log(data);
        const jobs = data;
        addJobsToDb(jobs, currentUser?.id);
        break;

      case 'USER_SIGN_IN':
        const { email, password } = data;
        toastNotify('Logging in.', 'Hold on..');
        handleEmailSignin(email, password)
          .then((user) => {
            console.log({ user });
            store.dispatch('SET_USER', user);
            chrome.runtime.sendMessage({
              action: 'SIGN_IN_SUCCESS',
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

      case 'USER_SIGN_OUT':
        handleSignOut()
          .then(() => {
            store.dispatch('SET_USER', null);
            chrome.runtime.sendMessage({
              action: 'SIGN_OUT_SUCCESS',
              user: null,
            });
            toastNotify('Successfully signed out');
          })
          .catch(() => {
            toastNotify('Error in signing out.', 'Please try again later');
          });
        break;

      default:
        console.log(' Warning: Unhandled action:', action);
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

supabase.auth.onAuthStateChange((event, session) => {
  const user = session?.user;
  console.log('setting user status ');

  console.log({ user });

  if (user) {
    store.dispatch('SET_USER', user);
  } else {
    store.dispatch('SET_USER', null);
    chrome.runtime.sendMessage({ action: 'SIGN_OUT_SUCCESS', user });
  }
});

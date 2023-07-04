/* eslint-disable no-case-declarations */
import { toastNotify } from '../common/common_utils';
import { initializeStorageWithDefaults } from '../storage';
import { Message } from '../types';
import { handleEmailSignin, handleSignOut } from './firebseUtils';

import store from './store';

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorageWithDefaults({});
  setInterval(() => {
    console.log('incrementing counter');
    store.dispatch('INCREMENT_COUNTER');
    console.log(store.getState().counter);
  }, 1000);

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

// // Message listener
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
        if (!savedUser) console.error('user not present bro!');
        sendReponse(savedUser);

        break;
      case 'USER_SIGN_IN':
        const { email, password } = data;
        const user = await handleEmailSignin(email, password);
        toastNotify('Successfully logged in');
        chrome.runtime.sendMessage({ action: 'SIGN_IN_SUCCESS', user });
        store.dispatch('SET_USER', user);
        break;

      case 'USER_SIGN_OUT':
        await handleSignOut();

        store.dispatch('SET_USER', null);
        chrome.runtime.sendMessage({ action: 'SIGN_OUT_SUCCESS', user });

        break;

      default:
        console.warn('Unhandled action:', action);
    }

    return true;
  },
);

// firebase.auth().onAuthStateChanged((user) => {
//   console.log({ user });
//   if (user) {
//     loginWithEmailForm.classList.add('hidden');
//     statsDiv.classList.remove('hidden');
//   } else {
//     statsDiv.classList.add('hidden');
//     loginWithEmailForm.classList.remove('hidden');
//   }
// });

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendReponse) => {
    const { action, data } = message;

    switch (action) {
      case 'SHOW_NOTIFICATION':
        toastNotify(data?.text);
        break;
      case 'GET_COUNTER':
        const state = store.getState();
        sendReponse(state);
        break;
      // case 'USER_SIGN_IN':
      //   const {email,password} =
      //   break;

      default:
        console.warn('Unhandled action:', action);
    }

    return true;
  },
);

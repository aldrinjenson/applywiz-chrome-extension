import { toastNotify } from '../common/common_utils';
import { initializeStorageWithDefaults } from '../storage';
import firebase from './fbConfig';

import store from './store';
import reducer from './reducer';

// Example usage
store.dispatch('SET_USER', { name: 'John Doe', email: 'johndoe@example.com' });

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorageWithDefaults({});
  console.log('Extension successfully installed!');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    console.log(
      `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
    );
  }
});

// // Message listener
// chrome.runtime.onMessage.addListener((message: Message) => {
//   const { action, data } = message;

//   switch (action) {
//     case 'ACTION_1':
//       handleAction1(data);
//       break;

//     case 'SHOW_NOTIFICATION':
//       // handleNotification(data);
//       toastNotify(data?.text);
//       break;

//     default:
//       console.warn('Unhandled action:', action);
//   }

//   return true;
// });

// // Example action handlers
// function handleAction1(data?: JSON) {
//   console.log('Handling Action 1 with data:', data);
// }

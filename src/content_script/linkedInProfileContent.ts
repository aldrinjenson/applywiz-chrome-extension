import { IS_THIS_USER_LOGGED_IN } from '../constants';

const isPaidUserLoggedIn = () => {
  const editButton = document.querySelector('button[aria-label="Edit intro"]');
  if (editButton) {
    console.log('correct user logged in');
  } else {
    console.log('same user is not the one logged in ');
  }

  return !!editButton;
};

window.addEventListener('load', async () => {
  console.log('Dom Loaded in LinkedIn Profile ');
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      switch (message.action) {
        case IS_THIS_USER_LOGGED_IN:
          sendResponse(isPaidUserLoggedIn());
          break;
        default:
          break;
      }
    },
  );
});

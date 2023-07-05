/* eslint-disable no-case-declarations */
import '../styles/popup.scss';
import { GeneralStore } from './common/General_store';
import { showNotification } from './common/common_utils';
const contentStore = new GeneralStore();

const loginWithEmailForm: HTMLFormElement =
  document.querySelector('#loginForm');
const statsDiv: HTMLDivElement = document.getElementById('stats');

const signOutButton = document.getElementById('signOutBtn');

signOutButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'USER_SIGN_OUT',
  });
});

const triggerMainSectionVisibility = (user?: JSON) => {
  if (user) {
    loginWithEmailForm.classList.add('hidden');
    statsDiv.classList.remove('hidden');
  } else {
    statsDiv.classList.add('hidden');
    loginWithEmailForm.classList.remove('hidden');
  }
};

loginWithEmailForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email: HTMLInputElement = document.getElementById('emailInput').value;
  const password: HTMLInputElement =
    document.getElementById('passwordInput').value;
  console.log('sending message');

  chrome.runtime.sendMessage({
    action: 'USER_SIGN_IN',
    data: { email, password },
  });
});

document.getElementById('go-to-options').addEventListener('click', () => {
  console.log('going to options');
  chrome.runtime.openOptionsPage();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('From Content Script: DOM Loaded');
  showNotification('Popup, loaded!');

  chrome.runtime.sendMessage({ action: 'GET_USER' }, (user) => {
    triggerMainSectionVisibility(user);
  });
});

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendReponse) => {
    const { action, data } = message;

    switch (action) {
      case 'SIGN_IN_SUCCESS':
        console.log('successfull signin');
        const user = data;
        contentStore.setState({ user });
        triggerMainSectionVisibility(user);
        break;

      case 'SIGN_OUT_SUCCESS':
        contentStore.setState({ user: null });
        triggerMainSectionVisibility(null);
        break;

      default:
        console.warn('Unhandled action:', action);
    }

    // return true;
  },
);

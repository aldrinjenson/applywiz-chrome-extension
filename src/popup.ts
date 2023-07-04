/* eslint-disable no-case-declarations */
import '../styles/popup.scss';
import { GeneralStore } from './content_script/content_store';
const contentStore = new GeneralStore();

const loginWithEmailForm: HTMLFormElement =
  document.querySelector('#loginForm');
const statsDiv: HTMLDivElement = document.getElementById('stats');

function showNotification(text: string) {
  chrome.runtime.sendMessage({ action: 'SHOW_NOTIFICATION', data: { text } });
}

const signOutButton = document.getElementById('signOutBtn');

signOutButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'USER_SIGN_OUT',
  });
});

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
    if (user) {
      loginWithEmailForm.classList.add('hidden');
      statsDiv.classList.remove('hidden');
    } else {
      statsDiv.classList.add('hidden');
      loginWithEmailForm.classList.remove('hidden');
    }
  });
});

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendReponse) => {
    const { action, data } = message;

    switch (action) {
      case 'SIGN_IN_SUCCESS':
        console.log('successfull signin');
        loginWithEmailForm.classList.add('hidden');
        statsDiv.classList.remove('hidden');
        contentStore.setState({ user: data.user });
        console.log(data.user);
        break;

      case 'SIGN_OUT_SUCCESS':
        statsDiv.classList.add('hidden');
        loginWithEmailForm.classList.remove('hidden');
        contentStore.setState({ user: null });
        break;

      default:
        console.warn('Unhandled action:', action);
    }

    return true;
  },
);

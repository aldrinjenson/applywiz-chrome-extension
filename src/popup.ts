/* eslint-disable no-case-declarations */
import '../styles/popup.scss';
import { GeneralStore } from './common/General_store';
import {
  GET_AUTOMATION_STATUS,
  GET_USER,
  SET_AUTOMATION_STATUS,
  USER_SIGN_IN,
  USER_SIGN_OUT,
} from './constants';
import { Message } from './types';
const contentStore = new GeneralStore();

const loginWithEmailForm: HTMLFormElement =
  document.querySelector('#loginForm');
const statsDiv: HTMLDivElement = document.getElementById('stats');
// const stopAutomationButton: HTMLButtonElement = document.querySelector(
//   '#stop-automation-btn',
// );
const inProgressWrapper: HTMLDivElement = document.querySelector(
  '#in-progress-wrapper',
);

const signOutButton = document.getElementById('signOutBtn');

signOutButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: USER_SIGN_OUT,
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
    action: USER_SIGN_IN,
    data: { email, password },
  });
});

document.getElementById('go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
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
        console.log(' Warning: Unhandled action:', action);
    }

    // return true;
  },
);

// setInterval(() => {
//   chrome.runtime.sendMessage({ action: GET_AUTOMATION_STATUS }, (resp) => {
//     console.log(resp);
//   });
// }, 1000);

// stopAutomationButton.addEventListener('click', () => {
//   chrome.runtime.sendMessage(
//     { action: SET_AUTOMATION_STATUS, data: false },
//     (resp) => {
//       console.log(resp);
//     },
//   );
// });

document.addEventListener('DOMContentLoaded', () => {
  console.log('From Content Script: DOM Loaded');
  chrome.runtime.sendMessage({ action: GET_USER }, (user) => {
    console.log('in popup: ');
    console.log({ user });

    triggerMainSectionVisibility(user);
  });
  // chrome.runtime.sendMessage({ action: GET_AUTOMATION_STATUS }, (status) => {
  //   console.log({ status });
  //   if (status) {
  //     inProgressWrapper.classList.remove('hidden');
  //   } else {
  //     inProgressWrapper.classList.add('hidden');
  //   }
  // });
});

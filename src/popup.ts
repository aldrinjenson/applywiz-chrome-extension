/* eslint-disable no-case-declarations */
import '../styles/popup.scss';
import { GeneralStore } from './common/General_store';
import {
  // GET_AUTOMATION_STATUS,
  GET_USER,
  // SET_AUTOMATION_STATUS,
  SET_USER,
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
// const inProgressWrapper: HTMLDivElement = document.querySelector(
//   '#in-progress-wrapper',
// );
const loadingSection: HTMLDivElement =
  document.querySelector('#loadingSection');

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
      case SET_USER:
        const user = data;
        contentStore.setState({ user });
        triggerMainSectionVisibility(user);
        break;
    }
  },
);

document.addEventListener('DOMContentLoaded', () => {
  console.log('From Content Script: DOM Loaded');
  loadingSection.innerText = 'Loading..';
  chrome.runtime.sendMessage({ action: GET_USER }, (user) => {
    console.log('in popup: ');
    triggerMainSectionVisibility(user);
    loadingSection.innerText = '';
  });
});

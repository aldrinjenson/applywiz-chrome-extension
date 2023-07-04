import '../styles/popup.scss';
import firebase from './fbConfig';

import store from './background/store';

// Example usage
store.subscribe((state) => {
  // Update UI based on state changes
  console.log('User:', state.user);
});

const loginWithEmailForm: HTMLFormElement =
  document.querySelector('#loginForm');
const statsDiv: HTMLDivElement = document.getElementById('stats');

function showNotification(text: string) {
  chrome.runtime.sendMessage({ action: 'SHOW_NOTIFICATION', data: { text } });
}

const signOutButton = document.getElementById('signOutBtn');

signOutButton.addEventListener('click', () => {
  firebase
    .auth()
    .signOut()
    .then(() => console.log('User signed out'))
    .catch((error) => console.error('Error signing out:', error));
});

loginWithEmailForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email: HTMLInputElement = document.getElementById('emailInput').value;
  const password: HTMLInputElement =
    document.getElementById('passwordInput').value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User logged in:', user);
      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Login error:', errorCode, errorMessage);
    });
});

document.getElementById('go-to-options').addEventListener('click', () => {
  console.log('going to options');
  chrome.runtime.openOptionsPage();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('From Content Script: DOM Loaded');
  store.dispatch('SET_USER', {
    name: 'Jane Smith',
    email: 'janesmith@example.com',
  });

  showNotification('Hello, world!');
});

firebase.auth().onAuthStateChanged((user) => {
  console.log({ user });
  if (user) {
    loginWithEmailForm.classList.add('hidden');
    statsDiv.classList.remove('hidden');
  } else {
    statsDiv.classList.add('hidden');
    loginWithEmailForm.classList.remove('hidden');
  }
});

import '../styles/popup.scss';

document.getElementById('go-to-options').addEventListener('click', () => {
  console.log('going to options');
  chrome.runtime.openOptionsPage();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('From Content Script: DOM Loaded');
});

import '../styles/popup.scss';

document.getElementById('go-to-options').addEventListener('click', () => {
  console.log('going to options');

  chrome.runtime.openOptionsPage();
});

document.addEventListener('DOMContentLoaded', () => {
  const openJobsButton = document.getElementById('openJobsButton');

  openJobsButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com/jobs/search?keywords=software+developer&f_AL=true' }, (tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'selectFirstJobCard' });
    });
  });


  // openJobsButton.addEventListener('click', () => {
  //   chrome.runtime.sendMessage({ action: 'openJobs' });
  // });


});


const startNowBtn = document.getElementById('startnowbtn')
startNowBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'selectFirstJobCard' });
  });
})
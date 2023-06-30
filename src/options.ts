import '../styles/options.scss';

const startBtn = document.querySelector('#applyBtn');
const jobKeywordInput = document.querySelector('#jobKeyword');

startBtn.addEventListener('click', () => {
  const jobKeyword = jobKeywordInput.innerText;
  const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
  chrome.tabs.create({ url, active: true }, (tab) => {
    console.log('new tab created');
    console.log(tab);
    chrome.tabs.sendMessage(tab.id, { action: 'start' }, (resp) => {
      console.log('response from content script', resp);
    });
  });
});

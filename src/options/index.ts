import '../../styles/options.scss';
import { getFiltersFromContentScript, waitForContentScriptLoad } from './utils';

const startBtn: HTMLButtonElement = document.querySelector('#applyBtn');
const jobKeywordInput: HTMLInputElement = document.querySelector('#jobKeyword');
const fetchFiltersBtn: HTMLButtonElement =
  document.querySelector('#fetchFiltersBtn');

startBtn.addEventListener('click', () => {
  const jobKeyword = jobKeywordInput.value;
  const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
  chrome.tabs.create({ url, active: true }, async (tab) => {
    await waitForContentScriptLoad(tab.id);
    chrome.tabs.sendMessage(tab.id, {
      action: 'START_AUTOMATION',
      data: { filters: {} },
    });
  });
});

fetchFiltersBtn.addEventListener('click', () => {
  const jobKeyword = jobKeywordInput.value;
  if (!jobKeyword) {
    return alert('Please enter a job Keyword');
  }
  getFiltersFromContentScript(jobKeyword);
});

import '../../styles/options.scss';
import { toastNotify } from '../common/common_utils';
import { createFilters } from './filterUtils';
import { filtersData } from './sampleFiltersData';
import { getFiltersFromContentScript, waitForContentScriptLoad } from './utils';

const jobKeywordInput: HTMLInputElement = document.querySelector('#jobKeyword');
const workExpInput: HTMLInputElement = document.querySelector('#workExp');
const filterContainer: HTMLDivElement =
  document.getElementById('filter-container');

const startBtn: HTMLButtonElement = document.querySelector('#applyBtn');
const fetchFiltersBtn: HTMLButtonElement =
  document.querySelector('#fetchFiltersBtn');

startBtn.addEventListener('click', () => {
  const jobKeyword = jobKeywordInput.value;
  const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
  chrome.tabs.create({ url, active: true }, async (tab) => {
    await waitForContentScriptLoad(tab.id);
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'START_AUTOMATION',
        data: { filters: {}, user: { workExp: workExpInput.value } },
      },
      () => {
        toastNotify('Automation starting..', 'Sit back and relax!');
      },
    );
  });
});

fetchFiltersBtn.addEventListener('click', async () => {
  const jobKeyword = jobKeywordInput.value;
  if (!jobKeyword) {
    return alert('Please enter a job Keyword');
  }
  const filters = await getFiltersFromContentScript(jobKeyword);
  toastNotify('Filters Received');
  createFilters(filters, filterContainer);
});

// createFilters(filtersData, filterContainer);

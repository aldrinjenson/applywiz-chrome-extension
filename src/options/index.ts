import '../../styles/options.scss';
import { toastNotify } from '../common/common_utils';
import { createFilters } from './filterUtils';
import { filtersData } from './sampleFiltersData';
import { getFiltersFromContentScript, waitForContentScriptLoad } from './utils';

const jobKeyword: string = document.querySelector('#jobKeyword').value;
const workExpInput: HTMLInputElement = document.querySelector('#workExp');
const noticePeriodInput: HTMLInputElement = document.querySelector('#notice');

const filterContainer: HTMLDivElement =
  document.getElementById('filter-container');

// const startBtn: HTMLButtonElement = document.querySelector('#applyBtn');
// startBtn.addEventListener('click', () => {
//   sendMessageToApplyToJobs(chosenFilters, []);
// });
const fetchFiltersBtn: HTMLButtonElement =
  document.querySelector('#fetchFiltersBtn');

const sendMessageToApplyToJobs = (
  filters: [],
  user?: { experience: string; notice: string },
) => {
  if (!user) {
    user = { experience: workExpInput.value, notice: noticePeriodInput.value };
  }
  const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
  chrome.tabs.create({ url, active: true }, async (tab) => {
    await waitForContentScriptLoad(tab.id);
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'START_AUTOMATION',
        data: { filters, user },
      },
      () => {
        toastNotify('Automation starting..', 'Sit back and relax!');
      },
    );
  });
};

const chosenFilters = [];

const submitHandler = (selectedFilterOptions: []) => {
  // chosenFilters = selectedFilterOptions;
  sendMessageToApplyToJobs(selectedFilterOptions);
  console.log(selectedFilterOptions);
};

fetchFiltersBtn.addEventListener('click', async () => {
  if (!jobKeyword) {
    return alert('Please enter a job Keyword');
  }
  toastNotify('Fetching Filters for: ', jobKeyword);
  const filters = await getFiltersFromContentScript(jobKeyword);
  toastNotify('Filters Received');
  createFilters(filters, filterContainer, submitHandler);
});

// createFilters(filtersData, filterContainer);

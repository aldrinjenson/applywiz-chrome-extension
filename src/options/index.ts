/* eslint-disable no-case-declarations */
import '../../styles/options.scss';
import { showNotification, toastNotify } from '../common/common_utils';
import { GeneralStore } from '../common/General_store';
import { Message } from '../types';
import { createFilters } from './filterUtils';
import { filtersData } from './sampleFiltersData';
import {
  addNewSkillExperienceRow,
  getFiltersFromContentScript,
  getExperience,
  waitForContentScriptLoad,
} from './optionUtils';

const optionStore = new GeneralStore();

const jobKeywordInput: HTMLInputElement = document.querySelector('#jobKeyword');
const mainContentSection = document.querySelector('main#main-content');
const noLoginSection = document.querySelector('#no-login');
const workExpInput: HTMLInputElement = document.querySelector('#workExp');
const expectedCtcInput: HTMLInputElement = document.querySelector('#expected');
const ctcInput: HTMLInputElement = document.querySelector('#ctc');
const noticePeriodInput: HTMLInputElement = document.querySelector('#notice');
const maxJobsInput: HTMLInputElement = document.getElementById('numJobs');
console.log(maxJobsInput.value);

const messagToHiringManagerInput: HTMLInputElement =
  document.querySelector('#message');
const addButton = document.getElementById('addButton');
addButton.addEventListener('click', addNewSkillExperienceRow);

const filterContainer: HTMLDivElement =
  document.getElementById('filter-container');

const userData = {
  experience: workExpInput.value,
  notice: noticePeriodInput.value,
  ctc: ctcInput.value,
  compensation: ctcInput.value,
  message: messagToHiringManagerInput.value,
  expected: expectedCtcInput.value,
};

// const startBtn: HTMLButtonElement = document.querySelector('#applyBtn');
// startBtn.addEventListener('click', () => {
//   sendMessageToApplyToJobs(filtersData, userData);
// });
const fetchFiltersBtn: HTMLButtonElement =
  document.querySelector('#fetchFiltersBtn');

const sendMessageToApplyToJobs = (
  filters: [],
  user?: { experience: string; notice: string },
) => {
  if (!user) {
    user = userData;
  }
  const jobKeyword = jobKeywordInput.value;
  const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
  chrome.tabs.create({ url, active: true }, async (tab) => {
    await waitForContentScriptLoad(tab.id);

    const experienceObj = getExperience();
    console.log(experienceObj);
    experienceObj['generalExp'] = workExpInput.value;
    user.experience = experienceObj;
    user.salary = user.ctc; // make this dynamic with multiple key values

    const payload = { filters, user, maxJobs: maxJobsInput.value };

    console.log({ payload });

    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'START_AUTOMATION',
        data: payload,
      },
      () => {
        toastNotify('Automation starting..', 'Sit back and relax!');
      },
    );
  });
};

const submitHandler = (selectedFilterOptions: []) => {
  sendMessageToApplyToJobs(selectedFilterOptions);
  console.log(selectedFilterOptions);
};

fetchFiltersBtn.addEventListener('click', async () => {
  const jobKeyword = jobKeywordInput.value;
  if (!jobKeyword) {
    return alert('Please enter a job Keyword');
  }
  toastNotify('Fetching Filters for: ', jobKeyword);
  fetchFiltersBtn.disabled = true;
  const filters = await getFiltersFromContentScript(jobKeyword);
  toastNotify('Filters Received');
  createFilters(filters, filterContainer, submitHandler);
  fetchFiltersBtn.disabled = false;
});

// createFilters(filtersData, filterContainer);

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendReponse) => {
    const { action, data } = message;
    console.log('in options handler');
    console.log(message);

    switch (action) {
      case 'SIGN_IN_SUCCESS':
        console.log('successfull signin');
        const user = data;
        optionStore.setState({ user });
        triggerMainSectionVisibility(user);
        break;

      case 'SIGN_OUT_SUCCESS':
        optionStore.setState({ user: null });
        triggerMainSectionVisibility(null);
        break;

      default:
        console.log(' Warning: Unhandled action:', action);
    }
  },
);

const triggerMainSectionVisibility = (user?: JSON) => {
  if (user) {
    noLoginSection.classList.add('hidden');
    mainContentSection.classList.remove('hidden');
  } else {
    mainContentSection.classList.add('hidden');
    noLoginSection.classList.remove('hidden');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('From Options Page: DOM Loaded');
  chrome.runtime.sendMessage({ action: 'GET_USER' }, (user) => {
    // triggerMainSectionVisibility(user);
    triggerMainSectionVisibility(true);
  });
});

// setInterval(() => {
//   getExperience();
// }, 3000);

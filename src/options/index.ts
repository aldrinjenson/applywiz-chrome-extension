/* eslint-disable no-case-declarations */
import '../../styles/options.scss';
import { showNotification, toastNotify } from '../common/common_utils';
import { GeneralStore } from '../common/General_store';
import { Message } from '../types';
import { createFilters } from './filterUtils';
import { filtersData } from './sampleFiltersData';
import {
  getFiltersFromContentScript,
  waitForContentScriptLoad,
} from './optionUtils';

const optionStore = new GeneralStore();

const jobKeyword: string = document.querySelector('#jobKeyword').value;
const mainContentSection = document.querySelector('main#main-content');
const noLoginSection = document.querySelector('#no-login');
const workExpInput: HTMLInputElement = document.querySelector('#workExp');
const ctcInput: HTMLInputElement = document.querySelector('#ctc');
const noticePeriodInput: HTMLInputElement = document.querySelector('#notice');
const messagToHiringManagerInput: HTMLInputElement =
  document.querySelector('#message');

const filterContainer: HTMLDivElement =
  document.getElementById('filter-container');

const userData = {
  experience: workExpInput.value,
  notice: noticePeriodInput.value,
  ctc: ctcInput.value,
  compensation: ctcInput.value,
  message: messagToHiringManagerInput.value,
};

const startBtn: HTMLButtonElement = document.querySelector('#applyBtn');
startBtn.addEventListener('click', () => {
  sendMessageToApplyToJobs(filtersData, userData);
});
const fetchFiltersBtn: HTMLButtonElement =
  document.querySelector('#fetchFiltersBtn');

const sendMessageToApplyToJobs = (
  filters: [],
  user?: { experience: string; notice: string },
) => {
  if (!user) {
    user = userData;
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

const submitHandler = (selectedFilterOptions: []) => {
  sendMessageToApplyToJobs(selectedFilterOptions);
  console.log(selectedFilterOptions);
};

fetchFiltersBtn.addEventListener('click', async () => {
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

    switch (action) {
      case 'SIGN_IN_SUCCESS':
        console.log('successfull signin');
        const { user } = data;
        optionStore.setState({ user });
        triggerMainSectionVisibility(user);
        break;

      case 'SIGN_OUT_SUCCESS':
        optionStore.setState({ user: null });
        triggerMainSectionVisibility(null);
        break;

      default:
        console.warn('Unhandled action:', action);
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
    triggerMainSectionVisibility(user);
  });
});

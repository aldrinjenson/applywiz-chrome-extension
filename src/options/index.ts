/* eslint-disable no-prototype-builtins */
/* eslint-disable no-case-declarations */
import '../../styles/options.scss';
import { toastNotify } from '../common/common_utils';
import { GeneralStore } from '../common/General_store';
import { Message } from '../types';
import { createFilters } from './filterUtils';
import { filtersData } from './sampleFiltersData';
import {
  addNewSkillExperienceRow,
  getAdvancedTagValues,
  getExperience,
} from './tagRowUtils';
import { updateWithSavedPreferences, saveUserPreferences } from './userPrefs';
import { GET_USER, SET_USER, START_AUTOMATION, isDevEnv } from '../constants';
import { getFirstName } from '../utils';
import {
  getFiltersFromContentScript,
  isRegisteredUserLoggedInToLinkedIn,
  waitForContentScriptLoad,
} from './option_content_script_related';
import allCountriesList from './countriesList';
import { fillResumeList } from './misc_utils';

const optionStore = new GeneralStore();

const alertMsgH1: HTMLHeadingElement = document.querySelector('#alert-msg');
const userGreetingH1: HTMLHeadingElement =
  document.querySelector('#user-greeting');
const candidateNameInput: HTMLInputElement = document.querySelector('#name');
const jobKeywordInput: HTMLInputElement = document.querySelector('#jobKeyword');
const mainContentSection = document.querySelector('main#main-content');
const noLoginSection = document.querySelector('#no-login');
const workExpInput: HTMLInputElement = document.querySelector('#workExp');
const expectedCtcInput: HTMLInputElement = document.querySelector('#expected');
const ctcInput: HTMLInputElement = document.querySelector('#ctc');
const noticePeriodInput: HTMLInputElement = document.querySelector('#notice');
const maxJobsInput: HTMLInputElement = document.querySelector('#numJobs');
const fetchResumeButton: HTMLButtonElement =
  document.querySelector('#fetch-resumes');
const chosenResumeInput: HTMLInputElement =
  document.querySelector('#chosen-resume');
const chosenCountryInput: HTMLInputElement =
  document.querySelector('#chosen-country');
const messagToHiringManagerInput: HTMLInputElement =
  document.querySelector('#message');

const addButton = document.getElementById('addButton');
addButton.addEventListener('click', () => addNewSkillExperienceRow());
const filterContainer: HTMLDivElement =
  document.querySelector('#filter-container');

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
  if (!workExpInput.value) {
    toastNotify(
      'Please fill in the General Experience value before applying..',
    );
    return;
  }

  const userData = {
    name: candidateNameInput.value,
    experience: workExpInput.value,
    notice: noticePeriodInput.value,
    ctc: ctcInput.value,
    salary: ctcInput.value,
    lpa: ctcInput.value,
    compensation: ctcInput.value,
    message: messagToHiringManagerInput.value,
    cover: messagToHiringManagerInput.value,
    letter: messagToHiringManagerInput.value,
    expected: expectedCtcInput.value,
    generalExp: workExpInput.value,
    chosenCountry: chosenCountryInput.value,
    chosenResume: chosenResumeInput.value,
    advancedTags: [],
  };
  if (!user) {
    user = userData;
  }
  console.log({ user });

  const jobKeyword = jobKeywordInput.value;
  const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
  chrome.tabs.create({ url, active: true }, async (tab) => {
    await waitForContentScriptLoad(tab.id);

    const experienceObj = getExperience();
    console.log(experienceObj);
    // user.generalExp = workExpInput.value;
    user.experience = experienceObj;
    user.advancedTags = getAdvancedTagValues();

    console.log(user.advancedTags);

    const payload = { filters, user, maxJobs: +maxJobsInput.value };
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: START_AUTOMATION,
        data: payload,
      },
      () => {
        toastNotify('Automation starting..', 'Sit back and relax!');
      },
    );
  });
};

const submitHandler = (selectedFilterOptions: []) => {
  chrome.runtime.sendMessage({ action: GET_USER }, async (user) => {
    toastNotify('Preparing environment', 'Hold on...');
    try {
      // change false
      if (!user || !user.linkedin_url) {
        throw new Error('Not signed in to extension');
      }
      if (await isRegisteredUserLoggedInToLinkedIn(user?.linkedin_url)) {
        // eslint-disable-next-line no-constant-condition
        // if (true) {
        sendMessageToApplyToJobs(selectedFilterOptions);
      } else {
        throw new Error('not logged in to correct account');
      }
    } catch (error) {
      console.log('error: ', error);
      toastNotify(
        'Please sign In to LinkedIn with your registered LinkedIn account',
        user?.linkedin_url,
      );
    }
  });
};

fetchFiltersBtn.addEventListener('click', async () => {
  let jobKeyword = jobKeywordInput.value;
  const chosenCountry = chosenCountryInput.value;
  console.log({ chosenCountry });

  if (!jobKeyword?.length) {
    if (isDevEnv) jobKeyword = 'Software Engineer';
    else return alert('Please enter a job Keyword');
  }
  saveUserPreferences();
  toastNotify('Fetching Filters for: ', jobKeyword);
  toastNotify('Saving preferences locally');
  fetchFiltersBtn.disabled = true;
  const filters = await getFiltersFromContentScript(jobKeyword, chosenCountry);
  if (filters?.length) {
    toastNotify('Filters Received');
    createFilters(filters, filterContainer, submitHandler);
  } else {
    toastNotify('Error in receiving filters.', 'Check internet and try again');
  }
  fetchFiltersBtn.disabled = false;
});

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendReponse) => {
    const { action, data } = message;
    console.log('in options handler');
    console.log(message);

    switch (action) {
      case SET_USER:
        console.log('updating user status');
        const user = data;
        optionStore.setState({ user });
        triggerMainSectionVisibility(user);
    }
  },
);

const triggerMainSectionVisibility = (user: {
  id: string;
  is_subscribed: boolean;
  name: string;
}) => {
  if (user?.id) {
    console.log('user present: ', user);
  }

  if (user && user?.hasOwnProperty('is_subscribed') && !user.is_subscribed) {
    console.log('inside changing h1');

    alertMsgH1.innerHTML =
      "Please subscribe to a plan at <a href='https://apply-wiz.com#pricing'>https://apply-wiz.com#pricing</a> to start applying to jobs!";
    return;
  }
  if (user?.id) {
    console.log('user id present');
    userGreetingH1.innerText = `Hello ${getFirstName(user.name)}, `;
    noLoginSection.classList.add('hidden');
    mainContentSection.classList.remove('hidden');
  } else {
    mainContentSection.classList.add('hidden');
    noLoginSection.classList.remove('hidden');
  }
};

const fillCountriesList = () => {
  const datalist = document.getElementById('country-list');
  allCountriesList.forEach((country) => {
    const option = document.createElement('option');
    option.value = country.name;
    datalist.appendChild(option);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('From Options Page: DOM Loaded');
  chrome.runtime.sendMessage({ action: GET_USER }, (user) => {
    triggerMainSectionVisibility(user);
    // triggerMainSectionVisibility(true); // temporary
    fillCountriesList();
    updateWithSavedPreferences();
  });
});

fetchResumeButton.addEventListener('click', fillResumeList);
// setTimeout(() => {
// }, 1000);

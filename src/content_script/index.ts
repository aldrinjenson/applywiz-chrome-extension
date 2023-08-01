// import { filtersData } from '../options/sampleFiltersData';
import {
  GET_FILTERS,
  RECEIVE_FILTERS,
  SET_AUTOMATION_STATUS,
  START_AUTOMATION,
} from '../constants';
import { waitForElement } from '../utils';
import {
  applyCountryNameInSearch,
  applySelectedFilters,
  getFilters,
} from './filter_utils';
import { payload } from './payload_data';
import { applyToJobs } from './scraper';

console.log('running from content script');

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.action) {
    case 'TEST': {
      // startAutomation();
      alert('set aayi bro!');
      sendResponse('working!');
      break;
    }
    case GET_FILTERS: {
      const { chosenCountry = '' } = message.data;
      console.log(chosenCountry);
      await applyCountryNameInSearch(chosenCountry);

      getFilters().then((filters) => {
        console.log(filters);
        chrome.runtime.sendMessage(
          { action: RECEIVE_FILTERS, data: filters },
          (resp) => {
            console.log('response', resp);
          },
        );
      });
      break;
    }
    case START_AUTOMATION: {
      const { filters, user, maxJobs } = message.data;
      console.log(message.data);
      const { chosenCountry } = user;
      sendResponse();

      await applyCountryNameInSearch(chosenCountry);
      await applySelectedFilters(filters);
      const noJobsExist = (await waitForElement({
        selector: '.jobs-search-no-results-banner__image',
      })) as HTMLButtonElement;
      if (noJobsExist) {
        alert(
          'No job exists which matches these filters. Go back and modify filters and try again.',
        );
        return;
      }

      chrome.runtime.sendMessage({ action: SET_AUTOMATION_STATUS, data: true });
      await applyToJobs(filters, user, maxJobs);
      chrome.runtime.sendMessage({
        action: SET_AUTOMATION_STATUS,
        data: false,
      });
      break;
    }
    default:
      console.log('Invalid action passed in message');
      break;
  }
});
window.addEventListener('load', async () => {
  console.log('window loaded bro');
  // applyCountryNameInSearch('France');
  // const stopBtn = document.createElement('btn')
  // document.body.appendChild(stopBtn)
  const { filters, user, maxJobs } = payload;
  // await applyToJobs(filters, user, 30);
  // await applyToJobs(filtersData, {
  //   experience: 1,
  //   notice: 2,
  //   ctc: 3,
  //   city: 'Thiruvananthapuram, Kerala, India',
  //   message: 'I will be a good fit',
  // });
});

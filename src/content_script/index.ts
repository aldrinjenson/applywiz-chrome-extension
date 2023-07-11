import { filtersData } from '../options/sampleFiltersData';
import { waitForElement } from '../utils';
import { applySelectedFilters, getFilters } from './filter_utils';
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
    case 'GET_FILTERS': {
      getFilters().then((filters) => {
        console.log(filters);
        chrome.runtime.sendMessage(
          { action: 'RECEIVE_FILTERS', data: filters },
          (resp) => {
            console.log('response', resp);
          },
        );
      });
      break;
    }
    case 'START_AUTOMATION': {
      const { filters, user, maxJobs } = message.data;
      console.log(message.data);
      await applySelectedFilters(filters);
      const noJobsExist: HTMLButtonElement = await waitForElement(
        '.jobs-search-no-results-banner__image',
      );
      if (noJobsExist) {
        alert(
          'No job exists which matches these filters. Go back and modify filters and try again.',
        );
        return;
      }
      await applyToJobs(filters, user, maxJobs);
      break;
    }
    default:
      console.log('Invalid action passed in message');
      break;
  }
});
window.addEventListener('load', async () => {
  console.log('window loaded bro');
  const { filters, user, maxJobs } = payload;
  await applyToJobs(filters, user, maxJobs);
  // await applyToJobs(filtersData, {
  //   experience: 1,
  //   notice: 2,
  //   ctc: 3,
  //   city: 'Thiruvananthapuram, Kerala, India',
  //   message: 'I will be a good fit',
  // });
});

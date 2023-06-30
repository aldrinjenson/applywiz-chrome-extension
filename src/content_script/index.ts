import { getFilters, applyToJobs } from './scraper';

console.log('running from content script');

window.addEventListener('load', async () => {
  console.log('window loaded bro');
});

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
      const filters = message.data.filters;
      console.log(filters);
      applyToJobs();
      break;
    }
    default:
      console.log('Invalid action passed in message');
      break;
  }
});

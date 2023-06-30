import '../styles/options.scss';

const startBtn = document.querySelector('#applyBtn');
const jobKeywordInput = document.querySelector('#jobKeyword');
const fetchFiltersBtn = document.querySelector('#fetchFiltersBtn');

async function waitForContentScriptLoad(tabId) {
  return new Promise<void>((resolve) => {
    const listener = function (updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener); // Remove the listener after the content script is loaded
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

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

const getFiltersFromContentScript = (keyword: string) => {
  const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
  chrome.tabs.create({ url, active: true }, async (tab) => {
    await waitForContentScriptLoad(tab.id);
    chrome.tabs.sendMessage(tab.id, {
      action: 'GET_FILTERS',
      data: { tabId: tab.id },
    });
  });

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log(message.action);
      if (message.action === 'RECEIVE_FILTERS') {
        console.log(message.data);
        alert('Filters received');
      }
    },
  );
};

fetchFiltersBtn.addEventListener('click', () => {
  const jobKeyword = jobKeywordInput.value;
  if (!jobKeyword) {
    return alert('Please enter a job Keyword');
  }
  getFiltersFromContentScript(jobKeyword);
});

export async function waitForContentScriptLoad(tabId) {
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

export const getFiltersFromContentScript = (keyword: string) => {
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

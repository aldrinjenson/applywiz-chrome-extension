/* eslint-disable @typescript-eslint/no-unused-vars */
export async function waitForContentScriptLoad(tabId: number) {
  return new Promise<void>((resolve) => {
    const listener = function (
      updatedTabId: number,
      changeInfo: { status: string },
    ) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener); // Remove the listener after the content script is loaded
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

export const getFiltersFromContentScript = (
  jobKeyword: string,
): Promise<string | []> => {
  return new Promise<string>((resolve) => {
    const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
    chrome.tabs.create({ url, active: false }, async (tab) => {
      await waitForContentScriptLoad(tab.id);
      chrome.tabs.sendMessage(tab.id, {
        action: 'GET_FILTERS',
        data: { tabId: tab.id },
      });
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'RECEIVE_FILTERS') {
        const filters = message.data;
        const ignoredFilters = [
          'Under 10 applicants',
          'In your network',
          'Easy Apply',
        ];

        const validFilters = filters.filter(
          (f: { name: string }) => !ignoredFilters.includes(f.name),
        );
        alert('Filters received');
        resolve(validFilters);
      }
    });
  });
};

export function waitForElement(selector, all = false, timeout = 6000) {
  console.log('waiting for ' + selector);
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.querySelector(selector);

      if (element) {
        console.log(selector + ' found');
        if (all) {
          resolve([...document.querySelectorAll(selector)]);
        } else {
          resolve(element);
        }
      } else if (Date.now() - startTime >= timeout) {
        reject(
          new Error(
            `Timeout: Element '${selector}' not found within ${timeout} milliseconds`,
          ),
        );
      } else {
        setTimeout(checkElement, 100); // Retry after 100 milliseconds
      }
    };

    return checkElement();
  });
}

export function trackNetworkRequests(url) {
  return new Promise((resolve) => {
    const openRequests = new Set();

    // Intercept fetch requests
    window.fetch = (function (oldFetch) {
      return function (...args) {
        const fetchPromise = oldFetch.apply(this, args);

        // Check if the request URL matches the specified URL
        if (args[0] === url) {
          openRequests.add(fetchPromise);
          fetchPromise.finally(() => {
            openRequests.delete(fetchPromise);

            // Check if all requests to the specified URL have completed
            if (openRequests.size === 0) {
              resolve(); // Resolve the promise when all requests are completed
            }
          });
        }

        return fetchPromise;
      };
    })(window.fetch);
  });
}

async function sleep(ms: number) {
  console.log('sleeping for ' + ms + ' ms');
  return new Promise((resolve) => setTimeout(resolve, ms));
}

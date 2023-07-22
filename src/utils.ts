export function waitForElement({
  selector,
  params,
}: {
  selector: string;
  params?: {
    all?: boolean;
    rootEl?: HTMLElement;
    timeout?: number;
  };
}): Promise<HTMLElement[] | HTMLElement> {
  const all = params?.all || false;
  const timeout = params?.timeout || 4000;
  const rootEl = params?.rootEl || document;

  console.log('waiting for ' + selector);
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element: HTMLElement = rootEl.querySelector(selector);

      if (element) {
        console.log(selector + ' found');
        if (all) {
          resolve(Array.from(rootEl.querySelectorAll(selector)));
        } else {
          resolve(element);
        }
      } else if (Date.now() - startTime >= timeout) {
        console.log(
          `Timeout: Element '${selector}' not found within ${timeout} milliseconds`,
        ),
          resolve(null);
      } else {
        setTimeout(checkElement, 75); // Retry after 100 milliseconds
      }
    };

    return checkElement();
  });
}

export function trackNetworkRequests(url: string) {
  return new Promise<void>((resolve) => {
    const openRequests = new Set();

    window.fetch = (function (oldFetch) {
      return function (...args) {
        const fetchPromise = oldFetch.apply(this, args);

        if (args[0] === url) {
          openRequests.add(fetchPromise);
          fetchPromise.finally(() => {
            openRequests.delete(fetchPromise);

            if (openRequests.size === 0) {
              resolve();
            }
          });
        }

        return fetchPromise;
      };
    })(window.fetch);
  });
}

export async function sleep(ms: number) {
  console.log('sleeping for ' + ms + ' ms');
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getFirstName = (fullName = '') => {
  const words = fullName.trim().split(/\s+/);
  if (words.length > 1 && words[0].length < 2) {
    return words[1];
  }
  return words[0];
};

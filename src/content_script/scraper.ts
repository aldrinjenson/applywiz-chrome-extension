import { sleep, waitForElement } from '../utils';

const handleAnyUnfilledColumns = async (user) => {
  console.log({ user });

  const errorDivs: HTMLDivElement[] = Array.from(
    document.querySelectorAll(
      'div[role="alert"][class^="artdeco-inline-feedback"]',
    ),
  );

  if (!errorDivs.length) return;

  const errorInputWrappers = errorDivs.map(
    (div) => div.parentElement.parentElement,
  );

  errorInputWrappers.forEach((wrapper) => {
    const label = wrapper.querySelector('label').innerText.toLowerCase();
    const input = wrapper.querySelector('input');
    let filedsFilled = false;
    for (const key in user) {
      console.log('filling');
      console.log(label, key.toLowerCase());

      if (label.includes(key.toLowerCase())) {
        input.value = user[key];
        const inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);
        filedsFilled = true;
        break;
      }
    }
    if (!filedsFilled) {
      throw new Error('Not able to fill all fields based on given user object');
    }
  });
  await sleep(5000);
};

export const applyToJobs = async (filters = [], user = {}) => {
  console.log('getting job links');
  const failedJobs = [];

  const jobSideCards: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>('.job-card-container--clickable'),
  );

  let count = 1;
  console.log(jobSideCards);
  console.log('Total Jobs found = ' + jobSideCards.length);

  for (const jobCard of jobSideCards) {
    const jobName = jobCard.outerText.replace(/Easy Apply\n|Hide job/g, '');
    try {
      jobCard.click();
      const applyButton = await waitForElement('.jobs-apply-button');
      applyButton.click();

      let isFormComplete = false;
      let formPageCount = 0;

      while (!isFormComplete && formPageCount++ < 4) {
        const nextButton: HTMLButtonElement = await waitForElement(
          'button[aria-label="Continue to next step"]',
        );
        console.log(nextButton);
        console.log({ formPageCount });

        await handleAnyUnfilledColumns(user);
        console.log('error handled');

        if (!nextButton) {
          const reviewButton: HTMLButtonElement = document.querySelector(
            'button[aria-label="Review your application"]',
          );
          console.log({ reviewButton });
          reviewButton.click();
          await handleAnyUnfilledColumns(user);
          reviewButton.click();
          const finalApplyButton: HTMLButtonElement = document.querySelector(
            'button[aria-label="Submit application"]',
          );
          console.log(finalApplyButton);
          console.log('form complete');
          // finalApplyButton.click();
          isFormComplete = true;
        } else {
          nextButton.click();
        }
      }

      if (count++ >= 4) break;
    } catch (error) {
      console.log('error bro: ', error);
      failedJobs.push({ url: window.location.href, jobName });
    }
    if (count++ >= 3) break;
  }
  console.log(failedJobs);

  return failedJobs;
};

export const scrollToFooter = async () => {
  console.log('scrolling');
  const footer = await waitForElement('#compactfooter-about');
  if (footer) {
    console.log('scrolling to footer');
    footer.scrollIntoView();
  } else {
    console.log('Element not found');
  }
};

export const getFilters = async () => {
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton: HTMLButtonElement = await waitForElement(
    filterButtonSelector,
  );
  filterButton.click();

  const availableFilters: { [x: string]: [y: string] }[] = [];
  const allFiltersLi = await waitForElement(
    '.search-reusables__secondary-filters-filter',
    true,
  );

  allFiltersLi.forEach((li) => {
    const type = li.querySelector('h3').innerText;
    const options = [
      ...li.querySelectorAll('.search-reusables__filter-value-item'),
    ];
    const availableOptions: { element: any; value: any; id: string }[] = [];
    options.forEach((option) => {
      const optionSpan = option.querySelector('span');
      const liInput = option.querySelector('input');
      availableOptions.push({
        value: optionSpan.innerText,
        id: liInput?.id,
        element: liInput,
      });
    });
    const newFilter = { name: type, options: availableOptions };
    availableFilters.push(newFilter);
  });
  console.log(availableFilters);
  return availableFilters;
};

import { sleep, waitForElement } from '../utils';

const handleAnyUnfilledColumns = async (user) => {
  console.log({ user });

  const errorDivs: HTMLDivElement[] = Array.from(
    document.querySelectorAll('li-icon[type="error-pebble-icon"]'),
  );

  if (!errorDivs.length) return false;

  console.log({ errorDivs });
  const errorInputWrappers = errorDivs.map(
    (div) => div.parentElement.parentElement.parentElement,
  );

  for (const wrapper of errorInputWrappers) {
    console.log(wrapper);

    const label = await waitForElement('label', false, wrapper);
    const labelText = label?.innerText?.toLowerCase() || '';
    const input = await waitForElement('input', false, wrapper);
    console.log({ labelText });

    let filedsFilled = false;

    // for handling checkboxes
    if (labelText === 'yes') {
      label.click();
      console.log('marking Yes');
      filedsFilled = true;
    }

    // for handling normal input fields
    for (const key in user) {
      if (labelText.includes(key.toLowerCase())) {
        try {
          input.value = user[key];
          const inputEvent = new Event('input', { bubbles: true });
          console.log('filling label: ', labelText, ' with key: ', key);

          input.dispatchEvent(inputEvent);
          filedsFilled = true;
        } catch (error) {
          console.log('error in matching input: ', input);
        } finally {
          // eslint-disable-next-line no-unsafe-finally
          break;
        }
      }
    }
    // for handling selects
    if (!filedsFilled) {
      const select = await waitForElement('select', false, wrapper);
      if (select) {
        console.log(labelText);
        console.log(select);
        console.log(select.options);
        const firstOption = select.options[1];
        select.value =
          firstOption.value.toLowerCase() !== 'none'
            ? firstOption.value
            : select.options[2].value;

        // const inputEvent = new Event('input', { bubbles: true });
        // select.dispatchEvent(inputEvent);

        const changeEvent = new Event('change', { bubbles: true });
        select.dispatchEvent(changeEvent);

        filedsFilled = true;
      }
    }

    // if still not filled, then mark the job as unable to fill
    if (!filedsFilled) {
      console.log(
        'Not able to fill all fields based on given user object for label: ' +
          labelText,
      );
      await sleep(2500);
      return true;
    }
  }
  console.log('before sleeping');
  await sleep(2000);
  console.log('after 5 second sleep');
};

const handleComplexity = async (user) => {
  const isTooComplexToFill: boolean = await handleAnyUnfilledColumns(user);
  console.log({ isTooComplexToFill });

  if (isTooComplexToFill) {
    alert('too complex');
    // close the job and throw error to try again
    const closeJobModalButton: HTMLButtonElement = await waitForElement(
      'button[aria-label="Dismiss"]',
    );
    closeJobModalButton?.click();
    const confirmDiscardJobButton: HTMLButtonElement = await waitForElement(
      '[data-control-name="discard_application_confirm_btn"]',
    );
    confirmDiscardJobButton.click();
    alert('dismissing');
    console.warn('Fields too complex to be filled. Skipping Job');
    return true;
  }
  return false;
};

export const applyToJobs = async (filters = [], user = {}) => {
  console.log('getting job links');
  const failedJobs = [];
  const successfullJobs = [];
  const alreadyAppliedJobs = [];

  const jobSideCards: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>('.job-card-container--clickable'),
  );
  console.log(jobSideCards);

  let count = 0;
  // console.log(jobSideCards);
  console.log('Total Jobs found = ' + jobSideCards.length);

  let maxCount = 7;

  for (let i = 0; i < jobSideCards.length; i++) {
    const jobCard = jobSideCards[i];
    console.log({ i, maxCount });

    if (count++ >= maxCount) break;

    const jobName = jobCard.outerText.replace(/Easy Apply\n|Hide job/g, '');
    const jobUrl = jobCard.querySelector('a').href;
    const jobObject = { jobUrl, jobName: jobName.replace(/\s{3,}/g, ' ') };
    console.log(
      'applying for job: ',
      count,
      ' with link = ',
      jobUrl,
      // ' and name = ',
      // jobName,
    );
    try {
      jobCard.click();
      await sleep(1000);

      const isAlreadyApplied = await waitForElement(
        'a.jobs-s-apply__application-link',
      );

      if (isAlreadyApplied) {
        maxCount++;
        alreadyAppliedJobs.push(jobObject);
        console.log('Already applied; moving on to next');
        alert('already applied; moving on');
        continue;
      }

      const applyButton: HTMLDivElement = await waitForElement(
        '.jobs-apply-button:not(.artdeco-button--disable)',
      );
      applyButton.click();

      let isFormComplete = false;
      let formPageCount = 0;

      let nextButtonSelector = 'button[aria-label="Continue to next step"]';
      const reviewButtonSelector =
        'button[aria-label="Review your application"]';
      const finalApplyButtonSelector =
        'button[aria-label="Submit application"]';

      let isFinalStep = false;
      while (!isFormComplete && formPageCount++ < 8) {
        const nextButton: HTMLButtonElement = await waitForElement(
          nextButtonSelector,
        );

        if (!nextButton) {
          const finalApplyButton: HTMLButtonElement = await waitForElement(
            finalApplyButtonSelector,
          );
          console.log({ finalApplyButton });

          if (!finalApplyButton) {
            nextButtonSelector = reviewButtonSelector;
          } else {
            nextButtonSelector = finalApplyButtonSelector;
            isFinalStep = true;
          }
          // const completedModal: HTMLButtonElement = await waitForElement(
          //   'div[aria-labelledby="post-apply-modal"]',
          // );
          // formPageCount++;
          continue;
        }

        console.log({ isFinalStep });
        console.log('before clicking');
        nextButton.click();
        console.log('after clicking');
        let isTooComplex = await handleComplexity(user);
        if (isTooComplex) {
          console.log('breaking..');
          break;
        }

        if (isFinalStep) {
          // nextButton?.click();
          console.log('form complete');
          isFormComplete = true;
          await waitForElement('li-icon[type="search"]'); // search icon which appears after the confirmation modal
          const closeJobModalButton: HTMLButtonElement = await waitForElement(
            'button[aria-label="Dismiss"]',
          );
          console.log('closing');
          await sleep(1200);
          closeJobModalButton?.click();
          successfullJobs.push(jobObject);
        }

        await sleep(2000);
      }
    } catch (error) {
      console.log('error bro: ', error);
      failedJobs.push(jobObject);
    }
  }

  // console.log(alreadyAppliedJobs);
  // console.log(failedJobs);
  // console.log(successfullJobs);

  const status = { alreadyAppliedJobs, successfullJobs, failedJobs };
  console.log(status);

  return status;
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
    const availableOptions: { value: string; id: string }[] = [];
    options.forEach((option) => {
      const optionSpan = option.querySelector('span');
      const liInput = option.querySelector('input');
      availableOptions.push({
        value: optionSpan.innerText,
        id: liInput?.id,
      });
    });
    const newFilter = { name: type, options: availableOptions };
    availableFilters.push(newFilter);
  });
  console.log(availableFilters);
  return availableFilters;
};

import { sleep, waitForElement } from '../utils';

export const fetchAllJobsInCurrPage = async () => {
  // to handle lazy loading or cards🙂
  let jobSideCards: HTMLElement[] = [];
  let numJobsFound = 0;

  // temporary, change max to 7
  const max = 1;
  // const max = 7
  for (let i = 0; i < max; i++) {
    jobSideCards = Array.from(
      document.querySelectorAll<HTMLElement>('.job-card-container--clickable'),
    );
    numJobsFound = jobSideCards.length;
    console.log('Total Jobs found = ' + numJobsFound);

    const footer: HTMLDivElement = await waitForElement({
      selector: '#compactfooter-about',
      params: { all: false, timeout: 2000 },
    });
    if (!footer) {
      jobSideCards[numJobsFound - 1].scrollIntoView({ behavior: 'smooth' });
      console.log('sleeping for 1 second');
      await sleep(1000);
    } else {
      console.log('footer found. breaking..');
      footer.scrollIntoView({ behavior: 'smooth' });
      await sleep(1000);
      break;
    }
  }
  jobSideCards[0].scrollIntoView({ behavior: 'smooth' });
  jobSideCards = Array.from(
    document.querySelectorAll<HTMLElement>('.job-card-container--clickable'),
  );
  console.log('loop done');
  return jobSideCards;
};

const handleAnyUnfilledColumns = async (user) => {
  console.log({ user });

  const errorDivs: HTMLDivElement[] = Array.from(
    document.querySelectorAll('li-icon[type="error-pebble-icon"]'),
  );

  if (!errorDivs.length) return false;

  const errorInputWrappers = errorDivs.map(
    (div) => div.parentElement.parentElement.parentElement,
  );

  for (const wrapper of errorInputWrappers) {
    // console.log(wrapper);

    // const label = await waitForElement('label', false, wrapper);
    const label = wrapper.querySelector('label');
    const labelText = label?.innerText?.toLowerCase() || '';
    const input = wrapper.querySelector('input');

    let fieldsFilled = false;

    // for handling checkboxes
    if (labelText === 'yes') {
      label.click();
      console.log('marking Yes in checkbox');
      fieldsFilled = true;
      continue;
    }

    if (labelText.includes('agree terms')) {
      label.click();
      console.log('clicking terms agree checkbox');
      fieldsFilled = true;
      continue;
    }

    // for handling experience input fields
    if (labelText.includes('experience')) {
      const inputEvent = new Event('input', { bubbles: true });
      for (const key in user.experience) {
        if (labelText.includes(key.toLowerCase())) {
          // console.log('key matches, key = ', key.toLowerCase());
          input.value = user.experience[key];
          console.log('filled experience with entered value');
          fieldsFilled = true;
          break; // break inner loop
        }
      }
      if (!fieldsFilled) {
        console.log(user);

        input.value = user.generalExp;
        console.log('filled experience with general exp');
        fieldsFilled = true;
      }
      input.dispatchEvent(inputEvent);
      continue;
    }

    // for handling normal input fields other than experience
    for (const key in user) {
      if (labelText.includes(key.toLowerCase())) {
        try {
          input.value = user[key];
          const inputEvent = new Event('input', { bubbles: true });
          console.log('filling label: ', labelText, ' with key: ', key);
          input.dispatchEvent(inputEvent);
          fieldsFilled = true;
        } catch (error) {
          console.log('error in matching input: ', input);
        } finally {
          // eslint-disable-next-line no-unsafe-finally
          break;
        }
      }
    }
    // for handling selects
    if (!fieldsFilled) {
      const select = await waitForElement({
        selector: 'select',
        params: {
          all: false,
          rootEl: wrapper,
        },
      });
      if (select) {
        const firstOption = select.options[1];
        select.value =
          firstOption.value.toLowerCase() !== 'none'
            ? firstOption.value
            : select.options[2].value;

        const changeEvent = new Event('change', { bubbles: true });
        select.dispatchEvent(changeEvent);
        fieldsFilled = true;
        console.log('handling select with first option');
      }
    }

    // if still not filled, then mark the job as unable to fill
    if (!fieldsFilled) {
      console.log(
        'Not able to fill all fields based on given user object for label: ' +
          labelText,
      );
      // await sleep(2500);
      return true;
    }
  }
  // console.log('before sleeping');
  // await sleep(4000);
  // console.log('after 5 second sleep');
  return false;
};

export const handleComplexity = async (user) => {
  const isTooComplexToFill: boolean = await handleAnyUnfilledColumns(user);
  console.log({ isTooComplexToFill });

  if (isTooComplexToFill) {
    alert('too complex');
    // close the job and throw error to try again
    const closeJobModalButton: HTMLButtonElement = await waitForElement({
      selector: 'button[aria-label="Dismiss"]',
    });
    closeJobModalButton?.click();
    const confirmDiscardJobButton: HTMLButtonElement = await waitForElement({
      selector: '[data-control-name="discard_application_confirm_btn"]',
    });
    confirmDiscardJobButton.click();
    alert('dismissing');
    console.log(' Warning: Fields too complex to be filled. Skipping Job');
    return true;
  }
  return false;
};

export const moveToNextPage = async () => {
  const paginationLis = Array.from(
    document.querySelectorAll('.artdeco-pagination__indicator'),
  );
  console.log(paginationLis);

  if (!paginationLis?.length) {
    console.log('only one page results exist! Returning..');
    return;
  }

  const currSelectedLi = paginationLis.find((li) =>
    li.classList.contains('selected'),
  );
  console.log(currSelectedLi);
  const currPageNum = +currSelectedLi.getAttribute(
    'data-test-pagination-page-btn',
  );
  console.log({ currPageNum });

  // const nextButton = document.querySelector(const liElement = document.querySelector('li[data-test-pagination-page-btn="1"]');)

  const nextLiElement = document.querySelector(
    `li[data-test-pagination-page-btn="${currPageNum + 1}"]`,
  );
  if (!nextLiElement) {
    console.log('Next page does not exist!');
  }
  const nextButton = nextLiElement.querySelector('button');
  nextButton.click();
  console.log('moving to next page');
  await sleep(2000);
};

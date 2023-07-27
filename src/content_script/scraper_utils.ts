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
  console.log(jobSideCards);
  console.log(jobSideCards.length + ' jobs found');

  return jobSideCards;
};

const handleAnyUnfilledColumns = async (user) => {
  const errorDivs: HTMLDivElement[] = Array.from(
    document.querySelectorAll('li-icon[type="error-pebble-icon"]'),
  );

  if (!errorDivs.length) return { status: false, reason: null };

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

    console.log({ user });
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
        input.value = user.generalExp;
        console.log('filled experience with general exp');
        fieldsFilled = true;
      }
      input.dispatchEvent(inputEvent);
      continue;
    }

    // for handling normal input fields other than experience
    // first priority given to advancedTags
    for (const tagRow of user.advancedTags) {
      console.log('searching in tags row');
      console.log(tagRow, labelText);

      const { tags = [], value = '' } = tagRow;

      let isMatchingAdvancedTagRowFound = true;
      for (const tag of tags) {
        const isNotIncluding = !labelText.includes(tag);
        console.log(tag, labelText);

        if (isNotIncluding) {
          // if not all tags in advancedTagRow matches
          isMatchingAdvancedTagRowFound = false;
          console.log('breaking');

          break;
        }
      }

      if (!isMatchingAdvancedTagRowFound) continue;
      console.log('mathing row found: ', tagRow);

      console.log({ input, value });
      input.value = value;
      console.log(input);

      const inputEvent = new Event('input', { bubbles: true });
      console.log(
        'filling label: ',
        labelText,
        ' with advanced row : ',
        tagRow,
      );
      input.dispatchEvent(inputEvent);
      fieldsFilled = true;
      alert('match found!');
      break;
    }
    // here
    // second priority given to other keys in user object
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
      console.log(label);
      const errorReason = `Cannot answer Input field: ${labelText}`;
      // await sleep(2500);
      return { status: true, reason: errorReason };
    }
  }
  // console.log('before sleeping');
  // await sleep(4000);
  // console.log('after 5 second sleep');
  return { status: false, reason: null };
};

export const handleComplexity = async (user) => {
  const complexityObj = await handleAnyUnfilledColumns(user);
  const { status: isTooComplex, reason: complexityReason } = complexityObj;
  console.log({ isTooComplex, complexityReason });

  if (isTooComplex) {
    console.log('too complex');
    // close the job and throw error to try again
    const closeJobModalButton = (await waitForElement({
      selector: 'button[aria-label="Dismiss"]',
    })) as HTMLButtonElement;
    closeJobModalButton?.click();
    const confirmDiscardJobButton = (await waitForElement({
      selector: '[data-control-name="discard_application_confirm_btn"]',
    })) as HTMLButtonElement;
    confirmDiscardJobButton.click();
    console.log('dismissing');
    console.log(' Warning: Fields too complex to be filled. Skipping Job');
  }
  return complexityObj;
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

export const handleErrorToastWhileSubmitting = async () => {
  const errorDivs = (await waitForElement({
    selector: 'div[data-test-artdeco-toast-item-type="error"]',
    params: { all: true },
  })) as HTMLElement[];

  if (!errorDivs || !errorDivs?.length) return false;

  console.log('Error toast chances found');

  const matchingErrorToast = errorDivs.find((divElement) => {
    const spanElement = divElement.querySelector('span');
    return spanElement;
    // && spanElement.innerText
    //   .trim()
    //   .includes(
    //     'There was an error while trying to submit your application, please try again.',
    //   )
  });

  if (!matchingErrorToast) return false;

  console.log('Error toast found');
  const toastCancelIcon: HTMLLIElement = matchingErrorToast.querySelector(
    'li-icon[type="cancel-icon"]',
  );
  await sleep(1000);
  toastCancelIcon.click();

  const dismissButton = document.querySelector(
    'button[data-test-modal-close-btn][aria-label="Dismiss"]',
  ) as HTMLButtonElement;

  // modularise from here:
  dismissButton.click();

  const discardJobButton = (await waitForElement({
    selector: 'button[data-control-name="discard_application_confirm_btn"]',
    params: { timeout: 5000 },
  })) as HTMLButtonElement;
  console.log({ discardJobButton });

  if (discardJobButton) {
    console.log('clicking discard Job button');
    discardJobButton.click();
  }
  return true;
};

export const getMaxProgressValue = async () => {
  const completenessMeterDiv = (await waitForElement({
    selector: '.artdeco-completeness-meter-linear',
    params: { all: false, timeout: 4000 },
  })) as HTMLDivElement;

  const siblingSpan =
    completenessMeterDiv?.nextElementSibling as HTMLSpanElement;

  if (!siblingSpan) {
    console.log('sibling span not found');

    return 0;
  }

  const progress = +siblingSpan.innerText.match(/\d+/)[0];

  return progress;
};

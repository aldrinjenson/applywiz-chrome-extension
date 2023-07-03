import { sleep } from '../utils';

export const fetchAllJobsInCurrPage = async (currPageNum) => {
  // to handle lazy loading or cards🙂
  let jobSideCards: HTMLElement[] = [];
  let numJobsFound = 0;

  // if currpagenum = 1, that means this is the first try. therefor already scrolled to bottom
  const maxNumLoops = currPageNum <= 1 ? 1 : 3;
  for (let i = 0; i < maxNumLoops; i++) {
    jobSideCards = Array.from(
      document.querySelectorAll<HTMLElement>('.job-card-container--clickable'),
    );
    numJobsFound = jobSideCards.length;
    console.log('Total Jobs found = ' + numJobsFound);
    jobSideCards[numJobsFound - 1].scrollIntoView();
    console.log('sleeping for 1 second');
    await sleep(1000);
  }
  console.log('loop done');
  return jobSideCards;
};

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

    let fieldsFilled = false;

    // for handling checkboxes
    if (labelText === 'yes') {
      label.click();
      console.log('marking Yes');
      fieldsFilled = true;
      continue;
    }

    if (labelText.includes('agree terms')) {
      label.click();
      console.log('clicking terms agree checkbox');
      fieldsFilled = true;
      continue;
    }

    // for handling normal input fields
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

        const changeEvent = new Event('change', { bubbles: true });
        select.dispatchEvent(changeEvent);

        fieldsFilled = true;
      }
    }

    // if still not filled, then mark the job as unable to fill
    if (!fieldsFilled) {
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

export const handleComplexity = async (user) => {
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

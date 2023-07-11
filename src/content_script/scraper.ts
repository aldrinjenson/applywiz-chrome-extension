import { sleep, waitForElement } from '../utils';
import {
  fetchAllJobsInCurrPage,
  handleComplexity,
  moveToNextPage,
} from './scraper_utils';

export const applyToJobs = async (filters = [], user = {}, maxCount = 10) => {
  console.log('getting job links');
  const failedJobs = [];
  const successfullJobs = [];
  const alreadyAppliedJobs = [];

  let jobSideCards: HTMLElement[] = await fetchAllJobsInCurrPage();
  console.log(jobSideCards);
  console.log(jobSideCards.length, ' jobs found in this page');

  let count = 0;
  // return;

  for (let i = 0; i < jobSideCards.length; i++) {
    const jobCard = jobSideCards[i];
    console.log({ i, count, maxCount });

    if (count++ > maxCount) break;

    const jobName = jobCard.outerText.replace(/Easy Apply\n|Hide job/g, '');
    const jobUrl = jobCard.querySelector('a').href;
    const jobObject = { jobUrl, jobName: jobName.replace(/\s{3,}/g, ' ') };
    console.log('applying for job: ', count, ' with link = ', jobUrl);
    try {
      jobCard.click();
      await sleep(1000);

      const isAlreadyApplied = await waitForElement({
        selector: 'a.jobs-s-apply__application-link',
        params: {
          all: false,
          timeout: 2500,
        },
      });

      if (isAlreadyApplied) {
        maxCount++;
        alreadyAppliedJobs.push(jobObject);
        console.log('Already applied; moving on to next');
        // alert('already applied; moving on');
        continue;
      }

      const applyButton: HTMLButtonElement = document.querySelector(
        '.jobs-apply-button:not(.artdeco-button--disable)',
      );
      const externalLinkIcon = applyButton.querySelector(
        'li-icon[aria-hidden="true"][type="link-external"]',
      );

      if (externalLinkIcon) {
        console.log('For applying to extenral site. Skipping..');
        count--;
        continue;
      }

      if (applyButton.disabled) {
        console.log('Apply button disabled. Skipping and moving on');
        failedJobs.push(jobCard);
        continue;
      }

      applyButton.click();

      let isFormComplete = false;
      let formPageCount = 0;

      let nextButtonSelector = 'button[aria-label="Continue to next step"]';
      const reviewButtonSelector =
        'button[aria-label="Review your application"]';
      const finalApplyButtonSelector =
        'button[aria-label="Submit application"]';

      let isFinalStep = false;

      while (!isFormComplete && formPageCount++ < 7) {
        const nextButton = (await waitForElement({
          selector: nextButtonSelector,
          params: {
            all: false,
            timeout: 1500,
          },
        })) as HTMLButtonElement;

        if (!nextButton) {
          const finalApplyButton = (await waitForElement({
            selector: finalApplyButtonSelector,
            params: {
              all: false,
              timeout: 1200,
            },
          })) as HTMLButtonElement;

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
        nextButton.click();
        const isTooComplex = await handleComplexity(user);
        if (isTooComplex) {
          console.log('breaking..');
          failedJobs.push(jobObject);
          break;
        }

        if (isFinalStep) {
          // nextButton?.click();
          console.log('form complete');
          isFormComplete = true;
          await waitForElement({ selector: 'li-icon[type="search"]' }); // search icon which appears after the confirmation modal
          const closeJobModalButton = (await waitForElement({
            selector: 'button[aria-label="Dismiss"]',
          })) as HTMLButtonElement;

          console.log('closing');
          await sleep(1200);
          closeJobModalButton?.click();
          successfullJobs.push(jobObject);
        }

        await sleep(250);
      }
    } catch (error) {
      console.log('error bro: ', error);
      failedJobs.push(jobObject);
    }

    if (i === jobSideCards.length - 1 && count < maxCount - 1) {
      // if last card and less than
      console.log('moving on to next page ');

      await moveToNextPage();
      console.log('fetching jobsidecards again');
      jobSideCards = await fetchAllJobsInCurrPage();
      i = 0;
    }
  }

  const status = { alreadyAppliedJobs, successfullJobs, failedJobs };
  console.log(status);

  return status;
};

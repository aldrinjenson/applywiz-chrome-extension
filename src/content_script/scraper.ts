import { SET_AUTOMATION_STATUS } from '../constants';
import { jobObjectType } from '../types';
import { sleep, waitForElement } from '../utils';
import { contentNotify, sendJobsDb } from './message_utils';
import { convertImageToBase64, selectChosenResume } from './misc_utils';
import {
  fetchAllJobsInCurrPage,
  getMaxProgressValue,
  handleComplexity,
  handleErrorToastWhileSubmitting,
  moveToNextPage,
} from './scraper_utils';

const shouldStopAutomation = false;
export const applyToJobs = async (filters = [], user = {}, maxCount = 10) => {
  console.log('getting job links');
  const failedJobs = [];
  const skippedJobs = [];
  const successfullJobs = [];
  const alreadyAppliedJobs = [];

  const slidingWindowSize = 1;
  let successfullJobSlidingWindow: jobObjectType[] = [];
  let jobSideCards: HTMLElement[] = await fetchAllJobsInCurrPage();

  console.log(jobSideCards);
  console.log(jobSideCards.length, ' jobs found in this page');

  let count = 0;
  let i, formPageCount;

  // for (let i = 0; i < jobSideCards.length; i++) {
  for (i = 0; count <= maxCount; i++, count++) {
    console.log({ i });
    const jobCard = jobSideCards[i];
    console.log({ i, count, maxCount });
    console.log({ jobSideCards, jobCard });

    let jobName = '';
    try {
      jobName = jobCard.querySelector('a').innerText.replace(/\s+/g, ' ');
    } catch (error) {
      console.log('error in querySelector: ', error);
      const newJobCards = await fetchAllJobsInCurrPage();
      if (newJobCards.length === jobSideCards.length) {
        console.log('all jobs parsed. not enough jobs');
        contentNotify(
          'Number of jobs with the selected filters is lesser than the jobs you wanted to apply. Exiting.',
          'Change filters and try again.',
        );
        break;
      } else {
        jobSideCards = newJobCards;
      }

      i--;
      continue;
    }
    const jobUrl = jobCard.querySelector('a').href;
    const companyImg =
      jobCard.querySelector('.ivm-view-attr__img--centered')?.src || '';
    const base64Img = (await convertImageToBase64(companyImg)) as string;

    const companyName = jobCard.querySelector(
      '.job-card-container__primary-description',
    ).innerText as string;
    const companyLocation = jobCard.querySelector('li').innerText;
    const jobObject: jobObjectType = {
      jobName,
      jobUrl,
      companyName,
      // companyImg,
      base64Img,
      companyLocation,
    };

    console.log(jobObject);
    console.log(`applying for job: ${count}: ${jobName} by ${companyName}`);
    contentNotify(`applying for job: ${count}: ${jobName} by ${companyName}`);

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
        skippedJobs.push(jobCard);
        continue;
      }

      applyButton.click();

      let isFormComplete = false;
      formPageCount = 0;

      let nextButtonSelector = 'button[aria-label="Continue to next step"]';
      const reviewButtonSelector =
        'button[aria-label="Review your application"]';
      const finalApplyButtonSelector =
        'button[aria-label="Submit application"]';

      let isFinalStep = false;

      console.log({ shouldStopAutomation });

      while (!isFormComplete && formPageCount++ < 7) {
        const nextButton = (await waitForElement({
          selector: nextButtonSelector,
          params: {
            all: false,
            timeout: 2500,
          },
        })) as HTMLButtonElement;

        const currentProgressBarValue = await getMaxProgressValue();

        if (currentProgressBarValue > 100) {
          console.log('Current Progress value > 100!');
          console.log('sleeping for 2.5 seconds and breaking to retry..');

          await sleep(2500);
          const dismissButton = document.querySelector(
            'button[data-test-modal-close-btn][aria-label="Dismiss"]',
          );

          // modularise from here:
          dismissButton.click();
          await sleep(1500);

          const discardJobButton = (await waitForElement({
            selector:
              'button[data-control-name="discard_application_confirm_btn"]',
            params: { timeout: 5000 },
          })) as HTMLButtonElement;
          console.log({ discardJobButton });

          if (discardJobButton) {
            console.log('clicking discard Job button');
            discardJobButton.click();
          }
          i--; // for trying again
          // till here. reuse both
          break;
        }

        if (!nextButton) {
          const finalApplyButton = (await waitForElement({
            selector: finalApplyButtonSelector,
            params: {
              all: false,
              timeout: 1200,
            },
          })) as HTMLButtonElement;

          if (!finalApplyButton) {
            nextButtonSelector = reviewButtonSelector;
          } else {
            nextButtonSelector = finalApplyButtonSelector;
            isFinalStep = true;
          }
          continue;
        }

        console.log({ shouldStopAutomation });

        if (shouldStopAutomation) {
          console.log('stopping automation');
          break;
        }

        await selectChosenResume(user.chosenResume);
        nextButton.click();
        const { status: isTooComplex, reason: complexityReason } =
          await handleComplexity(user);
        if (isTooComplex) {
          console.log('breaking..');
          jobObject.reason = complexityReason;
          failedJobs.push(jobObject);
          jobObject.status = 'failed';
          jobObject.progress = currentProgressBarValue;
          console.log('sending failed job to db');

          sendJobsDb([jobObject]);
          break;
        }

        if (isFinalStep) {
          // nextButton?.click();
          console.log('form complete');
          isFormComplete = true;
          const shouldRetry = await handleErrorToastWhileSubmitting();
          if (shouldRetry) {
            i--;
            break;
          }
          await waitForElement({ selector: 'li-icon[type="search"]' }); // search icon which appears after the confirmation modal
          const closeJobModalButton = (await waitForElement({
            selector: 'button[aria-label="Dismiss"]',
          })) as HTMLButtonElement;

          // await waitForElement({})

          console.log('closing');
          await sleep(1200);
          closeJobModalButton?.click();

          jobObject.status = 'success';
          successfullJobSlidingWindow.push(jobObject);
          successfullJobs.push(jobObject);
          if (successfullJobSlidingWindow.length === slidingWindowSize) {
            sendJobsDb(successfullJobSlidingWindow);
            successfullJobSlidingWindow = [];
          }
          await sleep(1500);
        }
      }
    } catch (error) {
      console.log('error bro: ', error);
      failedJobs.push(jobObject);
      jobObject.status = 'failed';
    }

    if (shouldStopAutomation) {
      console.log('stopping automation');
      break;
    }
    if (i >= jobSideCards.length - 1 && count < maxCount - 1) {
      // if last card and less than count

      const newJobSideCards = await fetchAllJobsInCurrPage();
      if (newJobSideCards.length === jobSideCards.length) {
        // if all jobs have been parsed
        console.log('moving on to next page ');
        const canMoveToNextPage = await moveToNextPage();
        if (!canMoveToNextPage) {
          contentNotify('Maximum jobs with this filter is done');
          console.log('breaking as no more jobs available');
          break;
        }
        console.log('fetching jobsidecards again');
        jobSideCards = await fetchAllJobsInCurrPage();
        i = 0;
      } else {
        // if some jobs habe been missed, parse them first before mobing on to next page
        for (const newJob of newJobSideCards) {
          if (!jobSideCards.includes(newJob)) {
            jobSideCards.push(newJob);
          }
        }
      }
    }
  }

  const status = { alreadyAppliedJobs, successfullJobs, failedJobs };
  console.log(status);

  console.log({ successfullJobSlidingWindow });

  if (successfullJobSlidingWindow.length) {
    sendJobsDb(successfullJobSlidingWindow);
  }
  console.log({ i, count, maxCount, formPageCount });

  return status;
};

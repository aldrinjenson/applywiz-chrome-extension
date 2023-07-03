import { sleep, waitForElement } from '../utils';
import { getNumPagesOfJobs } from './misc_utils';
import { fetchAllJobsInCurrPage, handleComplexity } from './scraper_utils';

export const applyToJobs = async (filters = [], user = {}, maxCount = 10) => {
  console.log('getting job links');
  const failedJobs = [];
  const successfullJobs = [];
  const alreadyAppliedJobs = [];

  let currPageNum = 0;
  const numberOfJobPages = await getNumPagesOfJobs();

  while (currPageNum++ < numberOfJobPages) {
    const jobSideCards: HTMLElement[] = await fetchAllJobsInCurrPage(
      currPageNum,
    );
    console.log(jobSideCards);
    console.log(jobSideCards.length, ' jobs found in this page');

    // return;

    let count = 0;

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
          const isTooComplex = await handleComplexity(user);
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
  }

  const status = { alreadyAppliedJobs, successfullJobs, failedJobs };
  console.log(status);

  return status;
};

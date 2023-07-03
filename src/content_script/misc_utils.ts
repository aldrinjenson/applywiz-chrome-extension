import { sleep, waitForElement } from '../utils';

export const scrollToFooter = async () => {
  const footer = await waitForElement('#compactfooter-about');
  if (footer) {
    console.log('scrolling to footer');
    footer.scrollIntoView();
    await sleep(1000);
  } else {
    console.log('Element not found');
  }
};

export const getNumPagesOfJobs = async () => {
  let jobSideCards: HTMLElement[] = [];
  let numJobsFound = 0;

  for (let i = 0; i < 3; i++) {
    jobSideCards = Array.from(
      document.querySelectorAll<HTMLElement>('.job-card-container--clickable'),
    );
    numJobsFound = jobSideCards.length;
    console.log('Total Jobs found = ' + numJobsFound);
    jobSideCards[numJobsFound - 1].scrollIntoView();
    console.log('sleeping for 1 second');
    await sleep(1000);
  }
  const numPages = document.querySelectorAll(
    '.artdeco-pagination__indicator',
  ).length;

  return numPages;
};

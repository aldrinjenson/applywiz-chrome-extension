import { waitForElement } from './utils';

const goOverJobs = async () => {
  console.log('getting job links');

  const jobSideCards = [
    ...document.querySelectorAll('.job-card-container--clickable'),
  ];
  let count = 1;
  console.log(jobSideCards);
  console.log('Total Jobs found = ' + jobSideCards.length);

  for (const jobCard of jobSideCards) {
    try {
      console.log('clicking');
      jobCard.click();

      await waitForElement('.jobs-apply-button');
      const applyButton = document.querySelector('.jobs-apply-button');
      applyButton.click();

      const nextButtonSelector = '.data-easy-apply-next-button';
      await waitForElement(nextButtonSelector);
      const nextButton = document.querySelector('.jobs-apply-button');
      nextButton.click();
      // applyButton.click()

      if (count++ >= 3) break;
    } catch (error) {
      console.log('error bro: ', error);
    }
    if (count++ >= 3) break;
  }
};

const scrollToFooter = async () => {
  console.log('scrolling');
  const footer = await waitForElement('#compactfooter-about');
  if (footer) {
    console.log('scrolling to footer');
    footer.scrollIntoView();
  } else {
    // Element not found
    console.log('Element not found');
  }
};

const getFilters = async () => {
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton = await waitForElement(filterButtonSelector);
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
    const newFilter = { [type]: availableOptions };
    availableFilters.push(newFilter);
  });
  console.log(availableFilters);
};

console.log('bro');

function selectFirstJobCard() {
  console.log('inside');
  alert('seleting first card');

  // Modify this code to select the first job card element on the page
  const jobCard = document.querySelector('.job-card');

  if (jobCard) {
    jobCard.click();
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'selectFirstJobCard') {
    selectFirstJobCard();
  }
});

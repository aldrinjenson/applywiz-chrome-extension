import { sleep, waitForElement } from '../utils';
import { contentNotify } from './message_utils';

const calculateAvailableJobsBasedOnFilter = async (
  showResultsButton: HTMLButtonElement,
) => {
  await sleep(1500);
  const showResultsSpan = showResultsButton.querySelector('span');
  const innerText = showResultsSpan.innerText;
  console.log({ showResultsSpan, innerText });

  contentNotify(innerText);
  console.log({ buttonInnerText: innerText });

  const kPlusPattern = /k\+/;
  const hasKPlus = kPlusPattern.test(innerText);

  if (hasKPlus) {
    console.log('More than 1 k+ jobs available it seems');
    return 1001;
  }

  const numberPattern = /\d+/;
  const matches = innerText.match(numberPattern);

  let number = null;
  if (matches && matches.length > 0) {
    number = parseInt(matches[0], 10);
  }

  return number;
};

export const applySelectedFilters = async (
  selectedFilters: [],
  maxJobs: number,
) => {
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton = (await waitForElement({
    selector: filterButtonSelector,
  })) as HTMLButtonElement;
  filterButton.click();

  //   waiting for the filter modal to open up
  const showResultsButton = (await waitForElement({
    selector: '[data-test-reusables-filters-modal-show-results-button="true"]',
  })) as HTMLButtonElement;

  for (const filter of selectedFilters) {
    for (const option of filter.options) {
      if (option.isSelected) {
        try {
          const input = document.getElementById(option.id);
          // const input = document.getElementById(option.id);
          input.click();
        } catch (error) {
          console.log('Error:', error);
        }
      }
    }
  }

  // const availableJobs = await calculateAvailableJobsBasedOnFilter(
  //   showResultsButton,
  // );
  // console.log({ isNum: isNaN(availableJobs), availableJobs });

  // if (availableJobs && !isNaN(availableJobs) && +availableJobs < maxJobs - 5) {
  //   alert(
  //     'Number of jobs available based on the filters applied is lesser than the maxJobs you have entered! Hit okay to proceed with maximum available jobs. Else close this tab and change filters in the Apply-Wiz options',
  //   );
  // }

  showResultsButton.click();
};

export const getFilters = async () => {
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton: HTMLButtonElement = await waitForElement({
    selector: filterButtonSelector,
  });
  if (!filterButton) {
    alert('Error in fetching filters. Reload extension page and try again.');
    return [];
  }
  filterButton.click();

  const availableFilters: { [x: string]: [y: string] }[] = [];
  const allFiltersLi = await waitForElement({
    selector: '.search-reusables__secondary-filters-filter',
    params: { all: true },
  });

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

export const applyCountryNameInSearch = async (countryName = '') => {
  if (!countryName) return;
  console.log('applying country name');

  const searchButton = (await waitForElement({
    selector: '.jobs-search-box__submit-button',
  })) as HTMLButtonElement;
  const locationSearchInput = (await waitForElement({
    selector: 'input[aria-label="City, state, or zip code"]',
  })) as HTMLInputElement;
  console.log(locationSearchInput, searchButton);

  locationSearchInput.value = countryName;
  console.log('clicking..');

  const inputEvent = new Event('input', { bubbles: true });
  locationSearchInput.dispatchEvent(inputEvent);
  searchButton.click();
};

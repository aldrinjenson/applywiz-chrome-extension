import { sleep, waitForElement } from '../utils';

export const applySelectedFilters = async (selectedFilters) => {
  console.log(selectedFilters);
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton = (await waitForElement({
    selector: filterButtonSelector,
  })) as HTMLButtonElement;
  filterButton.click();

  //   waiting for the filter modal to open up
  const showResultsButton = (await waitForElement({
    selector: '[data-test-reusables-filters-modal-show-results-button="true"]',
  })) as HTMLButtonElement;
  console.log({ showResultsButton });

  for (const filter of selectedFilters) {
    for (const option of filter.options) {
      if (option.isSelected) {
        try {
          const input = document.getElementById(option.id);
          input.click();
        } catch (error) {
          console.log('Error:', error);
        }
      }
    }
  }

  showResultsButton.click();
};

export const getFilters = async () => {
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton: HTMLButtonElement = await waitForElement({
    selector: filterButtonSelector,
  });
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
  await sleep(2500);
};

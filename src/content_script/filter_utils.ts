import { sleep, waitForElement } from '../utils';

export const applySelectedFilters = async (selectedFilters) => {
  console.log(selectedFilters);
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton: HTMLButtonElement = await waitForElement(
    filterButtonSelector,
  );
  filterButton.click();

  //   waiting for the filter modal to open up
  const showResultsButton: HTMLButtonElement = await waitForElement(
    '[data-test-reusables-filters-modal-show-results-button="true"]',
  );
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

  // console.log('sleping for 3 seconds before closing filter');
  // await sleep(3000);
  // console.log('sleping for 3 seconds done');
  console.log('clicking show results button');

  showResultsButton.click();
};

export const getFilters = async () => {
  const filterButtonSelector = '.search-reusables__all-filters-pill-button';
  const filterButton: HTMLButtonElement = await waitForElement(
    filterButtonSelector,
  );
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

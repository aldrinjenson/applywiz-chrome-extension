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

  for (const filter of selectedFilters) {
    for (const option of filter.options) {
      if (option.isSelected) {
        console.log(option);

        try {
          const input = document.getElementById(option.id);
          console.log(option);
          console.log(input);
          input.click();
        } catch (error) {
          console.log('Error:', error);
        }
      }
    }
  }

  showResultsButton.click();
};

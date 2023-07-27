export function createFilters(
  data: {
    name: string;
    options: { value: string; id: string }[];
  }[],
  rootElement = document.body,
  onClick: (
    arg0: {
      name: string;
      options: { value: string; id: string; isSelected: boolean }[];
    }[],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) => void = () => {},
) {
  // Create a form element
  rootElement.innerHTML = '';
  const form = document.createElement('form');
  const h2 = document.createElement('h2');
  h2.innerText = 'Select Preferred Filters';
  form.appendChild(h2);

  // Iterate over the data
  data.forEach(
    (filter: { name: string; options: { id: string; value: string }[] }) => {
      const { name: filterName, options: filterOptions } = filter;

      const wrapperDiv = document.createElement('div');
      wrapperDiv.classList.add('filter-wrapper');
      const heading = document.createElement('h3');
      heading.textContent = filterName;
      wrapperDiv.appendChild(heading);

      if (
        filterName.includes('Sort by') ||
        filterName.includes('Date posted')
      ) {
        // Create a radio button group
        const radioGroup = document.createElement('div');
        radioGroup.classList.add('radio-group');

        // Iterate over the options
        filterOptions.forEach((option) => {
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = filterName.replace(/\s/g, '-').toLowerCase();
          radio.value = option.id;
          radio.id = option.id;

          // Create a label for the radio button
          const label = document.createElement('label');
          label.textContent = option.value;
          label.htmlFor = option.id;
          radioGroup.appendChild(radio);
          radioGroup.appendChild(label);
        });
        // wrapperDiv.appendChild(radioGroup)
        wrapperDiv.appendChild(radioGroup);
      } else {
        // Create checkbox elements for other filters
        filterOptions.forEach((option) => {
          // Create a checkbox element
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = option.id;
          checkbox.id = option.id;

          // Create a label for the checkbox
          const label = document.createElement('label');
          label.textContent = option.value;
          label.htmlFor = option.id;

          // Append the checkbox and label to the form
          wrapperDiv.appendChild(checkbox);
          wrapperDiv.appendChild(label);
        });
      }

      form.appendChild(wrapperDiv);
    },
  );

  const submitButton = document.createElement('button');
  submitButton.classList.add('button2');
  submitButton.textContent = 'Start Applying';
  form.appendChild(submitButton);

  // Add an event listener to the submit button
  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    // Generate the selected options JSON
    const selectedOptions = data.map((filter) => {
      return {
        name: filter.name,
        options: filter.options.map((option) => {
          const inputElement: HTMLInputElement = document.getElementById(
            option.id,
          );
          return {
            value: option.value,
            id: option.id,
            isSelected: inputElement.checked,
          };
        }),
      };
    });

    onClick(selectedOptions);
  });

  rootElement.appendChild(form);
}

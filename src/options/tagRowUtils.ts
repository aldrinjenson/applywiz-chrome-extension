const container = document.getElementById('experienceContainer');
export function addNewSkillExperienceRow(
  skillName = '',
  experienceForSkill = '',
) {
  const row = document.createElement('div');
  row.className = 'row';

  const skillColumn = document.createElement('div');
  skillColumn.className = 'column';
  const skillInput = document.createElement('input');
  skillInput.type = 'text';
  skillInput.name = 'skill[]';
  skillInput.value = skillName;
  skillColumn.appendChild(skillInput);
  row.appendChild(skillColumn);

  const experienceColumn = document.createElement('div');
  experienceColumn.className = 'column';
  const experienceInput = document.createElement('input');
  experienceInput.type = 'text';
  experienceInput.name = 'experience[]';
  experienceInput.value = experienceForSkill;
  experienceColumn.appendChild(experienceInput);
  row.appendChild(experienceColumn);

  const addButton = document.createElement('div');
  addButton.className = 'button';
  addButton.innerHTML = '+';
  addButton.addEventListener('click', () => addNewSkillExperienceRow());
  row.appendChild(addButton);

  const removeButton = document.createElement('div');
  removeButton.className = 'button';
  removeButton.innerHTML = '-';
  removeButton.addEventListener('click', () => {
    container.removeChild(row);
  });
  row.appendChild(removeButton);
  container.appendChild(row);
}

export function getExperience(): {
  skill: string;
  experience: string | number;
}[] {
  const rows = document.getElementsByClassName('row');
  const skillsArray = [];

  for (let i = 1; i < rows.length; i++) {
    const skillInput: HTMLInputElement = rows[i].querySelector(
      "input[name='skill[]']",
    );
    const experienceInput: HTMLInputElement = rows[i].querySelector(
      "input[name='experience[]']",
    );
    const skill = skillInput?.value?.toLowerCase();
    const experience = +experienceInput?.value?.toLowerCase();

    if (skill && experience) {
      const skillObject = { skill, experience };
      skillsArray.push(skillObject);
    }
  }

  return skillsArray;
}

// const tagsContainer = document.querySelector('#advanced-tags-container');

// TypeScript code
const advancedTagsContainer = document.getElementById(
  'advanced-tags-container',
);

export const addNewTagRow = (tags = '', tagsValue = ''): void => {
  if (!advancedTagsContainer) return;

  const newRow = document.createElement('li');
  newRow.className = 'row';

  const newTagInput = document.createElement('input');
  newTagInput.type = 'text';
  newTagInput.name = 'tags[]';
  newTagInput.value = tags;

  const newValueInput = document.createElement('input');
  newValueInput.type = 'text';
  newValueInput.name = 'value';
  newValueInput.value = tagsValue;

  const addButton = document.createElement('div');
  addButton.className = 'button';
  addButton.textContent = '+';

  const removeButton = document.createElement('div');
  removeButton.className = 'button';
  removeButton.textContent = '-';

  addButton.addEventListener('click', () => addNewTagRow());
  removeButton.addEventListener('click', () =>
    advancedTagsContainer.removeChild(newRow),
  );

  newRow.appendChild(newTagInput);
  newRow.appendChild(newValueInput);
  newRow.appendChild(addButton);
  newRow.appendChild(removeButton);

  advancedTagsContainer.appendChild(newRow);
};

// Attach event listener to the initial + button
const initialAddButton = document.getElementById('addTagButton');
console.log({ initialAddButton });

if (initialAddButton) {
  initialAddButton.addEventListener('click', () => addNewTagRow());
}

export const getAdvancedTagValues = (): { tags: string[]; value: string }[] => {
  const rows = document.querySelectorAll('#advanced-tags-container .row');

  const tagValues: { tags: string[]; value: string }[] = [];

  rows.forEach((row) => {
    const tagInput = row.querySelector(
      'input[name="tags[]"]',
    ) as HTMLInputElement;
    const valueInput = row.querySelector(
      'input[name="value"]',
    ) as HTMLInputElement;

    if (tagInput?.value && valueInput?.value) {
      const tags = tagInput.value
        ?.toLowerCase()
        .split(',')
        .map((tag) => tag.trim());
      const value = valueInput.value?.trim().toLowerCase();
      tagValues.push({ tags, value });
    }
  });

  return tagValues;
};

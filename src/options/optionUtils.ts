/* eslint-disable @typescript-eslint/no-unused-vars */
export async function waitForContentScriptLoad(tabId: number) {
  return new Promise<void>((resolve) => {
    const listener = function (
      updatedTabId: number,
      changeInfo: { status: string },
    ) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener); // Remove the listener after the content script is loaded
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

export const getFiltersFromContentScript = (
  jobKeyword: string,
): Promise<string | []> => {
  return new Promise<string>((resolve) => {
    const url = `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${jobKeyword}`;
    chrome.tabs.create({ url, active: false }, async (tab) => {
      await waitForContentScriptLoad(tab.id);
      chrome.tabs.sendMessage(tab.id, {
        action: 'GET_FILTERS',
        data: { tabId: tab.id },
      });
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'RECEIVE_FILTERS') {
        const filters = message.data;
        const ignoredFilters = [
          'Under 10 applicants',
          'In your network',
          'Easy Apply',
        ];

        const validFilters = filters.filter(
          (f: { name: string }) => !ignoredFilters.includes(f.name),
        );
        resolve(validFilters);
      }
    });
  });
};

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

export function getExperience() {
  const rows = document.getElementsByClassName('row');
  const skillsArray = [];

  for (let i = 1; i < rows.length; i++) {
    const skillInput = rows[i].querySelector("input[name='skill[]']");
    const experienceInput = rows[i].querySelector("input[name='experience[]']");

    const skill = skillInput.value;
    const experience = +experienceInput.value;

    if (skill && experience) {
      const skillObject = { skill, experience };
      skillsArray.push(skillObject);
    }
  }

  return skillsArray;
}

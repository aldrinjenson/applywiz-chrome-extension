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

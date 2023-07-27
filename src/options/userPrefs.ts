/* eslint-disable no-prototype-builtins */
import { GET_USER_PREFERENCES, SET_USER_PREFERENCES } from '../constants';
import {
  addNewSkillExperienceRow,
  addNewTagRow,
  getAdvancedTagValues,
  getExperience,
} from './tagRowUtils';

const allInputFields = document.querySelectorAll('input');
export const saveUserPreferences = () => {
  console.log('gonna save user preferences');

  const searchPreferences: {
    experiences: { skill: string; experience: string | number };
    advancedTags: { tags: string[]; value: string }[];
    [x: string]: string | { tags: string[]; value: string }[];
  } = {};

  allInputFields.forEach((inp) => {
    if (inp.id) searchPreferences[inp.id] = inp.value;
  });
  searchPreferences.experiences = getExperience();
  searchPreferences.advancedTags = getAdvancedTagValues();

  console.log({ searchPreferences });

  console.log('sending request to save users');

  chrome.runtime.sendMessage({
    action: SET_USER_PREFERENCES,
    data: searchPreferences,
  });
};

export const updateWithSavedPreferences = async () => {
  // send chrome message to retrieve data .
  // add a listener to accept the object and restore it in input fields
  console.log('sending request to get saved users');

  chrome.runtime.sendMessage(
    { action: GET_USER_PREFERENCES },
    (savedUserPreferrences) => {
      console.log({ savedUserPreferrences });
      if (!savedUserPreferrences) return;

      allInputFields.forEach((inp) => {
        const { id: inputId } = inp;
        if (savedUserPreferrences?.hasOwnProperty(inputId)) {
          inp.value = savedUserPreferrences[inputId];
        }
      });

      savedUserPreferrences?.experiences.forEach(
        (exp: { skill: string; experience: string }) => {
          const { skill, experience: years } = exp;
          addNewSkillExperienceRow(skill, years);
        },
      );

      savedUserPreferrences?.advancedTags?.forEach(
        (tagRow: { tags: string[]; value: string }) => {
          addNewTagRow(tagRow.tags.join(', '), tagRow.value);
        },
      );
    },
  );
};

/* eslint-disable no-case-declarations */
import { GET_RESUMES, RECEIVE_RESUMES } from '../constants';
import { waitForElement } from '../utils';
import { toastNotify } from './common_utils';

console.log('bro');

const getResumeNames = async () => {
  try {
    let resumes = await waitForElement({
      selector: '.ui-attachment__filename.jobs-resume-card__filedata',
      params: { all: true },
    });
    console.log(resumes);

    resumes = Array.from(resumes);
    console.log(resumes);
    const resumeNames = resumes.map((res) => res.innerText);
    console.log({ resumeNames });
    return resumeNames;
  } catch (error) {
    console.log('error in getting resumes', error);
    toastNotify(
      'Error in getting resumes!',
      'Check internet and sign in to your LinkedIn account',
    );
    return [];
  }
};

window.addEventListener('load', async () => {
  console.log('Dom Loaded in LinkedIn settings page');
  getResumeNames();
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      switch (message.action) {
        case GET_RESUMES:
          sendResponse();
          const resumeNames = await getResumeNames();
          console.log({ resumeNames });
          chrome.runtime.sendMessage({
            action: RECEIVE_RESUMES,
            data: resumeNames,
          });
          break;
        default:
          break;
      }
    },
  );
});

import { toastNotify } from '../common/common_utils';
import { GET_RESUMES, RECEIVE_RESUMES } from '../constants';
import { waitForContentScriptLoad } from './option_content_script_related';

const chosenResumeInput: HTMLInputElement =
  document.querySelector('#chosen-resume');

export const fillResumeList = () => {
  console.log('yo');

  toastNotify('Fetching Resumes from LinkedIn: ');

  chrome.tabs.create(
    {
      url: 'https://www.linkedin.com/jobs/application-settings',
      active: false,
    },
    async (tab) => {
      await waitForContentScriptLoad(tab.id);

      chrome.tabs.sendMessage(tab.id, {
        action: GET_RESUMES,
        data: null,
      });
      chrome.runtime.onMessage.addListener(
        async (message, sender, sendResponse) => {
          switch (message.action) {
            case RECEIVE_RESUMES:
              console.log(message.data);
              fillDataList(message.data);
              break;
            default:
              break;
          }
        },
      );
    },
  );
  const fillDataList = (resumeList: string[]) => {
    const resumeDataList = document.getElementById('resume-list');
    resumeList.forEach((res: string) => {
      const option = document.createElement('option');
      option.value = res;
      resumeDataList.appendChild(option);
    });
  };
};

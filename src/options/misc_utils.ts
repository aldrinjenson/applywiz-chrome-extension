import { toastNotify } from '../common/common_utils';
import { GET_RESUMES, RECEIVE_RESUMES } from '../constants';
import { contentNotify } from '../content_script/message_utils';
import { waitForContentScriptLoad } from './option_content_script_related';

const clearResumesBtn: HTMLButtonElement = document.querySelector('#clear-btn');

export const fillResumeList = () => {
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
              chrome.tabs.remove(sender.tab.id);
              break;
            default:
              break;
          }
        },
      );
    },
  );
  const fillDataList = (resumes: string[]) => {
    const resumeDataList = document.getElementById(
      'resume-list',
    ) as HTMLDataListElement;

    const resumeInputField = document.getElementById(
      'chosen-resume',
    ) as HTMLInputElement;

    resumeDataList.innerHTML = '';
    resumes.forEach((res: string) => {
      const option = document.createElement('option');
      option.value = res;
      resumeDataList.appendChild(option);
    });

    toastNotify('Resumes received from LinkedIn');
    resumeInputField.value = resumes[0];
    clearResumesBtn.addEventListener('click', () => {
      resumeInputField.placeholder = 'Click here and start typing..';
      resumeInputField.value = '';
    });
  };
};

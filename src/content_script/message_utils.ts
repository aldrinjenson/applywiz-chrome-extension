import { ADD_JOBS_TO_DB, SHOW_NOTIFICATION } from '../constants';
import { jobObjectType } from '../types';

export const sendJobsDb = (jobObjects: jobObjectType[]) => {
  chrome.runtime.sendMessage({
    action: ADD_JOBS_TO_DB,
    data: jobObjects,
  });
};

export const contentNotify = (title: string, message = '', type = 'basic') => {
  chrome.runtime.sendMessage({
    action: SHOW_NOTIFICATION,
    data: { title, message, type },
  });
};

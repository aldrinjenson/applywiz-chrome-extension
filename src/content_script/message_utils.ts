import { ADD_JOBS_TO_DB } from '../constants';
import { jobObjectType } from '../types';

export const sendJobsDb = (jobObjects: jobObjectType[]) => {
  chrome.runtime.sendMessage({
    action: ADD_JOBS_TO_DB,
    data: jobObjects,
  });
};

export const sendJobsDb = (jobObjects = []) => {
  chrome.runtime.sendMessage({
    action: ADD_JOBS_TO_DB,
    data: jobObjects,
  });
};

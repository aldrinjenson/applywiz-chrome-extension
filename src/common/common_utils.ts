export const toastNotify = (title: string, message = '', type = 'basic') => {
  chrome.notifications.create(
    {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/48x.png'),
      title,
      message,
    },
    (notificationId) => {
      console.log('notification sent with id: ', notificationId);
    },
  );
};

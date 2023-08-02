function closeNotification(notificationId: string) {
  chrome.notifications.clear(notificationId);
}

export const toastNotify = (title: string, message = '', type = 'basic') => {
  const notificationId = `notification_${Date.now()}`;
  try {
    chrome.notifications.create(
      notificationId,
      {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/48x.png'),
        title,
        message,
      },
      (notificationId) => {
        // console.log('notification sent');
      },
    );
    setTimeout(() => {
      closeNotification(notificationId);
    }, 3000);
  } catch (error) {
    console.log('error in creating notification: ', error);
  }
};

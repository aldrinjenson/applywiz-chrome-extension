import '../styles/popup.scss';

console.log('broski');

document.getElementById('go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

console.log('in popup');

const checkUserLoginStatus = () => {
  return true
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('new request received');
  console.log(request);
  console.log(sender);

  if (request.action === 'checkLoginStatus') {
    console.log('action matched');

    // Check if the user is logged in (replace with your login check logic)
    const isLoggedIn = checkUserLoginStatus();
    console.log(isLoggedIn);


    // Send the response back to the content script
    sendResponse({ isLoggedIn: isLoggedIn });
  }
});

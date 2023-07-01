- multiple content scripts and one background script/service worker

- have one content script for productname.com/success?userId=sdfsdf&username=sdfdsfds which has a **receiver/event listener**
- when the user has successfully made a purchase, the content script should activate and run. it should make an API call to check if the userId is a valid purchaser of the product. If so call the chrome api to open the options page/dashboard of scraper

- have another content script called scraper.js which does the actual scraping. This should be matching only linkedin/jobs domain. There should be an **event listener** in this page that waits for an action to message to start the scraping.

- all the storage and other actions could be done by background.js

import '../styles/popup.scss';

document.getElementById('go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// console.log('hello');


// console.log('hello');

// const func = () => {
//     const jobLinks = [...document.querySelectorAll('a')]
//         .map((link) => link.href)
//         .filter((el) => el.includes('/jobs/'))
//         // .slice(1);
//         .slice(1, 3);
//     console.log(jobLinks);


//     function openAndApply(link) {
//         return new Promise((resolve, reject) => {
//             const newTab = window.open(link, '_blank');

//             const interval = setInterval(() => {
//                 if (newTab.closed) {
//                     clearInterval(interval);
//                     reject(new Error(`Failed to open link: ${link}`));
//                 } else if (newTab.document.readyState === 'complete') {
//                     clearInterval(interval);
//                     const applyButton = newTab.document.querySelector('.jobs-apply-button');
//                     if (applyButton) {
//                         applyButton.click();
//                         resolve();
//                     } else {
//                         reject(new Error(`Failed to find apply button in link: ${link}`));
//                     }
//                 }
//             }, 100); // Adjust the interval as needed
//         });
//     }


//     for (const link in jobLinks) {
//         alert(link);
//     }
// }

// console.log('gonna run');

// func()
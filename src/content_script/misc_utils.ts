import { sleep, waitForElement } from '../utils';

export const scrollToFooter = async () => {
  const footer: HTMLDivElement = await waitForElement('#compactfooter-about');
  if (footer) {
    console.log('scrolling to footer');
    footer.scrollIntoView();
    await sleep(1000);
  } else {
    console.log('Element not found');
  }
};

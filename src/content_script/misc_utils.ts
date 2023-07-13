import { sleep, waitForElement } from '../utils';

export const scrollToFooter = async () => {
  const footer = (await waitForElement({
    selector: '#compactfooter-about',
  })) as HTMLElement;
  if (footer) {
    console.log('scrolling to footer');
    footer.scrollIntoView();
    await sleep(1000);
  } else {
    console.log('Element not found');
  }
};

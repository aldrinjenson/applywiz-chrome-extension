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

export const convertImageToBase64 = async (imageUrl = '') => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.readAsDataURL(blob);

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64data = result.split(',')[1];
        resolve(
          `data:${response.headers.get('content-type')};base64,${base64data}`,
        );
      };

      reader.onerror = () => {
        // reject(new Error('Failed to read the image file.'));
        resolve('');
      };
    });
  } catch (error) {
    console.log('Error in fetching the company image URL.');
  }
};

export const selectChosenResume = async (chosenResume = '') => {
  if (!chosenResume) {
    await sleep(1000);
    return;
  }
  const availableResumes = (await waitForElement({
    selector: '.jobs-document-upload-redesign-card__container h3',
    params: { all: true, timeout: 2000 },
  })) as HTMLElement[];

  console.log({ availableResumes });

  if (!availableResumes?.length) return false;

  for (const resumeH3 of availableResumes) {
    const resumeName = resumeH3.innerText;
    if (resumeName === chosenResume) {
      resumeH3.click();
      console.log('clicking chosen resume..');
      return true;
    }
  }
};

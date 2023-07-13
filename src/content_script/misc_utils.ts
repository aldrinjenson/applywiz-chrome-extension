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
        reject(new Error('Failed to read the image file.'));
      };
    });
  } catch (error) {
    throw new Error('Failed to fetch the image URL.');
  }
};

// // Usage:
// const imageUrl = 'https://media.licdn.com/dms/image/C560BAQHJBk6qu2-dhw/company-logo_100_100/0/1588230150518?e=1697068800&v=beta&t=94kQn81zJfK9TFMUCFMEK8Doht1QeaU3ccAaraKkt3U';

// convertImageToBase64(imageUrl)
//   .then(base64String => {
//     console.log(base64String); // Base64 encoded image with "data:image/png;base64" part
//   })
//   .catch(error => {
//     console.error(error);
//   });

import { trackNetworkRequests, waitForElement } from './utils';

async function sleep(ms: number) {
    console.log('sleeping for ' + ms + ' ms');
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const goOverJobs = async () => {
    console.log('getting job links');

    const jobSideCards = [
        ...document.querySelectorAll('.job-card-container--clickable'),
    ];
    let count = 1;
    console.log(jobSideCards);
    console.log('Total Jobs found = ' + jobSideCards.length);

    for (const jobCard of jobSideCards) {
        try {
            console.log('clicking');
            jobCard.click();

            await waitForElement('.jobs-apply-button');
            const applyButton = document.querySelector('.jobs-apply-button');
            applyButton.click();

            const nextButtonSelector = '.data-easy-apply-next-button';
            await waitForElement(nextButtonSelector);
            const nextButton = document.querySelector('.jobs-apply-button');
            nextButton.click();
            // applyButton.click()

            if (count++ >= 3) break;
        } catch (error) {
            console.log('error bro: ', error);
        }
        if (count++ >= 3) break;
    }
};

const scrollToFooter = async () => {
    console.log('scrolling');
    const footer = await waitForElement('#compactfooter-about')
    console.log(footer);

    if (footer) {
        console.log('scrolling to footer');
        footer.scrollIntoView();
    } else {
        // Element not found
        console.log('Element not found');
    }
};


const getFilters = async () => {
    const filterButtonSelector = ".search-reusables__all-filters-pill-button"
    const filterButton = await waitForElement(filterButtonSelector)
    console.log(filterButton);
    filterButton.click()

    const availableFilters: { [x: string]: [y: string]; }[] = []
    const allFiltersLi = await waitForElement('.search-reusables__secondary-filters-filter', true)
    console.log(allFiltersLi);

    allFiltersLi.forEach(li => {
        const type = li.querySelector('h3').innerText
        console.log(type);
        const options = [...li.querySelectorAll('.search-reusables__filter-value-item')]
        const availableOptions = []
        options.forEach(option => {
            console.log(option);
            const optionSpan = option.querySelector('span')
            availableOptions.push({ element: optionSpan, value: optionSpan.innerText })
        })
        const newFilter = { [type]: availableOptions }
        availableFilters.push(newFilter)
    })

    console.log(availableFilters);



}

window.addEventListener('load', async () => {
    console.log('windod loaded bro');
    await sleep(2500);
    console.log('sleep done');
    // await scrollToFooter();
    // await sleep(2500)
    console.log('sleep done');
    await getFilters()
    // await sleep(1000)
    // await goOverJobs();

    // Your code here
    // It will run after all resources have loaded
});

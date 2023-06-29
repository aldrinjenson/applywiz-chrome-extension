function getXPathForElement(element) {
    if (!(element instanceof Element)) {
        throw new Error('Invalid element provided.');
    }

    // Check if the element has an ID, and if so, use it as the selector
    if (element.id) {
        return `id("${element.id}")`;
    }

    // Generate an XPath selector based on the element's position and attributes
    const xpathParts = [];
    let currentElement = element;

    while (currentElement !== document.documentElement) {
        let position = 1;
        let sibling = currentElement.previousElementSibling;

        while (sibling) {
            if (sibling.nodeName === currentElement.nodeName) {
                position++;
            }
            sibling = sibling.previousElementSibling;
        }

        let tagName = currentElement.tagName.toLowerCase();
        if (currentElement.className) {
            tagName += `[@class="${currentElement.className}"]`;
        }

        xpathParts.unshift(`${tagName}[${position}]`);
        currentElement = currentElement.parentElement;
    }

    return `/${xpathParts.join('/')}`;
}


function getSelectorForElement(element) {
    if (!(element instanceof Element)) {
        throw new Error('Invalid element provided.');
    }

    // If the element already has an ID, use it as the selector
    if (element.id) {
        return `#${element.id}`;
    }

    // Generate a selector based on the element's tag name and attributes
    const selectorParts = [];
    let currentElement = element;

    while (currentElement.parentNode) {
        let selector = currentElement.tagName.toLowerCase();

        if (currentElement.classList.length > 0) {
            const classes = Array.from(currentElement.classList).map((className) => `.${className}`).join('');
            selector += classes;
        }

        selectorParts.unshift(selector);
        currentElement = currentElement.parentNode;
    }

    return selectorParts.join(' > ');
}

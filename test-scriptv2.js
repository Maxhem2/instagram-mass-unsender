function findLastMatchingElement(elements) {
    var lastMatchingElement = null;

    Array.from(elements).forEach(function(element) {
        var attributes = element.attributes;
        var roleAttribute = attributes.getNamedItem('role');
        var ariaLabelAttribute = attributes.getNamedItem('aria-label');

        if (roleAttribute && ariaLabelAttribute) {
            var roleIndex = Array.from(attributes).indexOf(roleAttribute);
            var ariaLabelIndex = Array.from(attributes).indexOf(ariaLabelAttribute);

            if (roleIndex < ariaLabelIndex) {
                lastMatchingElement = element;
            }
        }
    });

    return lastMatchingElement;
}

// Function to simulate mouse hovering
function simulateMouseHover(element) {
    // Scroll to the element
    element.scrollIntoView({
        behavior: 'auto', // Instant scrolling
        block: 'center',
        inline: 'center'
    });

    // Dispatch the mouseover event immediately after scrolling
    var event = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    element.dispatchEvent(event);
    // Wait for the target div with three circles and click it
    findDivWithThreeCircles();
}

// Function to repeatedly check for the existence of an element with an optional maximum attempts limit
function waitForElementToExist(callback, maxAttempts = false) {
    let attemptCount = 0;

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const resultElement = callback();

            if (resultElement) {
                clearInterval(interval);
                resolve(resultElement);
            } else if (resultElement === undefined) {
                clearInterval(interval);
                findDivWithThreeCircles(true);
                reject(new Error('Element not found after undefined result.'));
            } else {
                attemptCount++;

                if (maxAttempts !== false && attemptCount >= maxAttempts) {
                    clearInterval(interval);
                    reject(new Error(`Element not found after ${maxAttempts} attempts.`));
                } else {
                    console.log(`Element not found yet. Attempt ${attemptCount}`);
                }
            }
        }, 100);
    });
}

// Function to find the div element with three circles
function findDivWithThreeCircles(close = false) {
    const resultPromise = waitForElementToExist(() => {
        const svgElement = document.querySelector('div[role="button"] svg circle:nth-of-type(1) + circle + circle');

        if (svgElement) {
            const targetDiv = svgElement.closest('div[role="button"]');
            return targetDiv || null;
        }

        return null;
    }, 10); // Set maximum attempts to 10

    resultPromise.then((targetDiv) => {
        targetDiv.click(); // Click the found div with three circles
        if (!close) {
            findMenuItemAndClick();
        }
    }).catch((error) => {
        console.error(error);
    });
}

function findMenuItemAndClick() {
    const resultPromise = waitForElementToExist(() => {
        const menuItems = document.querySelectorAll('div[role="menuitem"]');
        let matchCounter = 0;
    
        for (const menuItem of menuItems) {
            matchCounter++;
    
            if (matchCounter === 3) {
                const parentDiv = menuItem.parentElement;
                if (parentDiv.getAttribute('role') === 'none') {
                    return menuItem;
                } else {
                    console.log('The parent div of the third menu item does not have role="none"');
                    return undefined;
                }
            }
        }
    
        if (menuItems.length === 1) {
            const singleMenuItem = menuItems[0];
            const parentDiv = singleMenuItem.parentElement;
            if (parentDiv.getAttribute('role') === 'none') {
                return singleMenuItem;
            } else {
                console.log('The parent div of the single menu item does not have role="none"');
                return undefined;
            }
        }
        
    });
    
    resultPromise.then((menuItem) => {
        menuItem.click(); // Click the found menu item
        clickFirstButtonInLastDialog();
    });
}

function clickFirstButtonInLastDialog() {
    const resultPromise = waitForElementToExist(() => {
        // Get all div elements with role="dialog"
        const dialogDivs = document.querySelectorAll('div[role="dialog"]');

        // Get the last dialog div if any were found
        const lastDialogDiv = dialogDivs.length > 0 ? dialogDivs[dialogDivs.length - 1] : null;

        // Find the first button within the last dialog div
        const firstButton = lastDialogDiv ? lastDialogDiv.querySelector('button') : null;

        return firstButton;
    });

    resultPromise.then((firstButton) => {
        firstButton.click(); // Click the first button within the last dialog
    });
}


// Get all elements with tabindex="0"
var elements = document.querySelectorAll('[tabindex="0"]');

// Simulate mouse hovering
simulateMouseHover(findLastMatchingElement(elements));
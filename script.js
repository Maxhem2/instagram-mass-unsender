(function() {
    // --------------------- State Tracking ---------------------
    let isRunning = true;

    // --------------------- Overlay Implementation ---------------------

    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'automation-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999',
            cursor: 'not-allowed'
        });

        const message = document.createElement('div');
        message.innerText = 'Unsending messages - Keep this window visible - Details in DevConsole!';
        Object.assign(message.style, {
            fontSize: '24px',
            marginBottom: '20px',
            textAlign: 'center',
            color: '#333'
        });

        const killButton = document.createElement('button');
        killButton.innerText = 'Stop script?';
        Object.assign(killButton.style, {
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#ff4d4d',
            color: '#fff'
        });

        killButton.addEventListener('click', () => {
            console.warn('Kill Script button clicked. Terminating the script...');
            isRunning = false;
            removeOverlay();
        });

        overlay.appendChild(message);
        overlay.appendChild(killButton);

        document.body.appendChild(overlay);
    }

    function removeOverlay() {
        const overlay = document.getElementById('automation-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    createOverlay();

    // --------------------- Utility Functions ---------------------

    /**
     * Simulates a mouse event on a given element.
     * @param {Element} element - The target element.
     * @param {string} eventType - The type of mouse event (e.g., 'click', 'mouseover').
     */
    function simulateMouseEvent(element, eventType) {
        const event = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true,
            buttons: 1
        });
        element.dispatchEvent(event);
    }

    /**
     * Simulates a click event on a given element.
     * @param {Element} element - The target element.
     */
    function simulateClick(element) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    /**
     * Introduces a delay for a specified number of milliseconds.
     * @param {number} ms - The delay duration in milliseconds.
     * @returns {Promise} - Resolves after the specified delay.
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --------------------- Constants and Selectors ---------------------

    const MESSAGE_CONTAINER_SELECTOR = '.x1n2onr6 .x78zum5.xdt5ytf[data-scope="messages_table"][role="gridcell"]';
    const MORE_BUTTON_ARIA_LABEL = 'More';
    const UNSEND_SVG_ARIA_LABEL = 'Unsend';
    const CONFIRM_UNSEND_TEXT = 'Unsend';
    const CONFIRM_UNSEND_TABINDEX = 0;
    const VIEW_PROFILE_TEXT = 'View profile';

    const USER_MESSAGE_IDENTIFIERS = [
        /You sent/i,
        /You replied/i
        // Add more as needed
    ];

    // --------------------- State Tracking ---------------------
    const processedMessages = new Set();

    // --------------------- Helper Functions ---------------------

    /**
     * Determines if a message element is a user message based on predefined identifiers.
     * @param {Element} messageElement - The message container element.
     * @returns {boolean} - True if it's a user message; otherwise, false.
     */
    function isUserMessage(messageElement) {
        return USER_MESSAGE_IDENTIFIERS.some(pattern => pattern.test(messageElement.innerText));
    }

    /**
     * Determines if a message element is unsupported.
     * @param {Element} messageElement - The message container element.
     * @returns {boolean} - True if it's an unsupported message; otherwise, false.
     */
    function isUnsupportedMessage(messageElement) {
        return /Unsupported message/i.test(messageElement.innerText);
    }

    /**
     * Checks if an element is within the viewport.
     * @param {Element} element - The target element.
     * @returns {boolean} - True if the element is in the viewport; otherwise, false.
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Waits until the scrollable container has finished scrolling.
     * Resolves when the scroll position remains unchanged for 100ms.
     * Ensures a minimum 1-second delay after scrolling.
     * @param {Element} container - The scrollable container element.
     * @returns {Promise} - Resolves when scrolling is complete.
     */
    async function waitForScrollToFinish(container) {
        if (!isRunning) return Promise.resolve();

        return new Promise((resolve) => {
            let lastScrollTop = container.scrollTop;
            let ticking = false;

            const onScroll = () => {
                if (!isRunning) {
                    container.removeEventListener('scroll', onScroll);
                    resolve();
                    return;
                }

                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        if (container.scrollTop === lastScrollTop) {
                            container.removeEventListener('scroll', onScroll);
                            resolve();
                        }
                        lastScrollTop = container.scrollTop;
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            container.addEventListener('scroll', onScroll);

            // In case the scroll event doesn't fire (already at the desired position)
            setTimeout(() => {
                container.removeEventListener('scroll', onScroll);
                resolve();
            }, 1000);
        }).then(() => delay(1000));
    }

    /**
     * Continuously searches for the "More" button within the message element.
     * Resolves once the button is found and clicked or times out after 10 seconds.
     * Ensures a minimum 1-second delay after clicking.
     * @param {Element} messageElement - The message container element.
     * @returns {Promise<boolean>} - Resolves to true if "More" button was clicked, false otherwise.
     */
    function waitForMoreButton(messageElement) {
        return new Promise((resolve) => {
            let elapsedTime = 0;
            const timeout = 10000;
            const intervalTime = 100;

            const checkInterval = setInterval(async () => {
                if (!isRunning) {
                    clearInterval(checkInterval);
                    resolve(false);
                    return;
                }

                const moreButton = messageElement.querySelector(`[aria-label="${MORE_BUTTON_ARIA_LABEL}"]`);
                if (moreButton) {
                    console.log(`"More" button found:`, moreButton);
                    simulateClick(moreButton);
                    console.log(`Clicked the "${MORE_BUTTON_ARIA_LABEL}" button.`);
                    clearInterval(checkInterval);

                    await delay(1000);
                    resolve(true);
                } else {
                    elapsedTime += intervalTime;
                    if (elapsedTime >= timeout) {
                        console.warn(`"More" button not found within ${timeout / 1000} seconds.`);
                        clearInterval(checkInterval);
                        resolve(false);
                    }
                }
            }, intervalTime);
        });
    }

    /**
     * Continuously searches for the "Unsend" SVG button anywhere in the document until it is found and clicked.
     * Ensures a minimum 1-second delay after clicking.
     * Waits up to 10 seconds for the "Unsend" SVG to appear.
     * @returns {Promise<boolean>} - Resolves to true if "Unsend" was clicked, false otherwise.
     */
    function findAndClickUnsendSvg() {
        return new Promise((resolve) => {
            let elapsedTime = 0;
            const timeout = 10000;
            const intervalTime = 100;

            const checkInterval = setInterval(async () => {
                if (!isRunning) {
                    clearInterval(checkInterval);
                    resolve(false);
                    return;
                }

                const unsendSvgs = document.querySelectorAll(`svg[aria-label="${UNSEND_SVG_ARIA_LABEL}"]`);
                const visibleUnsendSvg = Array.from(unsendSvgs).find(svg => {
                    return !!(svg.offsetWidth || svg.offsetHeight || svg.getClientRects().length);
                });

                if (visibleUnsendSvg) {
                    console.log('Found visible "Unsend" SVG:', visibleUnsendSvg);

                    let targetElement = visibleUnsendSvg;
                    while (targetElement && targetElement.tagName.toLowerCase() !== 'button') {
                        targetElement = targetElement.parentElement;
                    }

                    if (targetElement && targetElement.tagName.toLowerCase() === 'button') {
                        console.log('Clicking the parent button of the "Unsend" SVG:', targetElement);
                        simulateClick(targetElement);
                    } else {
                        console.log('Clicking the "Unsend" SVG directly.');
                        simulateClick(visibleUnsendSvg);
                    }

                    console.log('Clicked the "Unsend" SVG button.');
                    clickConfirmUnsend();

                    await delay(1000);
                    clearInterval(checkInterval);
                    resolve(true);
                } else {
                    elapsedTime += intervalTime;
                    if (elapsedTime >= timeout) {
                        console.warn(`"Unsend" SVG not found within ${timeout / 1000} seconds. Unable to unsend the message.`);
                        clearInterval(checkInterval);
                        resolve(false);
                    }
                }
            }, intervalTime);
        });
    }

    /**
     * Continuously searches for the confirmation "Unsend" button until it is found and clicked.
     * Ensures a minimum 1-second delay after clicking.
     */
    function clickConfirmUnsend() {
        const checkInterval = setInterval(async () => {
            if (!isRunning) {
                clearInterval(checkInterval);
                return;
            }

            const allElements = document.querySelectorAll('*');
            for (let element of allElements) {
                if (element.textContent.includes(CONFIRM_UNSEND_TEXT) && element.tabIndex === CONFIRM_UNSEND_TABINDEX) {
                    console.log('Confirmation "Unsend" button found:', element);
                    simulateClick(element);
                    console.log(`Clicked the confirmation "${CONFIRM_UNSEND_TEXT}" button.`);
                    clearInterval(checkInterval);

                    await delay(1000);
                    break;
                }
            }
        }, 100);
    }

    /**
     * Checks if the "View profile" element is present and visible in the viewport.
     * @returns {boolean} - True if "View profile" is visible; otherwise, false.
     */
    function checkViewProfile() {
        let elements = document.querySelectorAll('a');
        let viewProfileElement = Array.from(elements).find(el => el.textContent.trim() === VIEW_PROFILE_TEXT);

        if (viewProfileElement) {
            console.log('View profile element is present');
            if (isInViewport(viewProfileElement)) {
                console.log('View profile element is visible in the viewport');
                return true;
            } else {
                console.log('View profile element is not visible in the viewport');
                return false;
            }
        } else {
            console.log('View profile element is not present');
            return false;
        }
    }

    /**
     * Finds the scrollable container within the message containers.
     * @returns {Element|null} - The scrollable container element or null if not found.
     */
    function findScrollableContainer() {
        const messageContainers = document.querySelectorAll(MESSAGE_CONTAINER_SELECTOR);
        if (messageContainers.length === 0) {
            console.log('No message containers found to identify the scrollable container.');
            return null;
        }

        let messageElement = messageContainers[0];
        let parent = messageElement.parentElement;

        while (parent) {
            const style = window.getComputedStyle(parent);
            const overflowY = style.getPropertyValue('overflow-y');
            if (overflowY === 'auto' || overflowY === 'scroll') {
                console.log('Scrollable container identified:', parent);
                return parent;
            }
            parent = parent.parentElement;
        }

        console.log('Scrollable container not found by traversing from message container.');
        return null;
    }

    /**
     * Waits until a specific DOM element has been removed from the page.
     * @param {Element} element - The DOM element to monitor.
     * @param {number} timeoutMs - Maximum wait time in milliseconds.
     * @returns {Promise} - Resolves if the element is removed within the timeout; rejects otherwise.
     */
    function waitForElementToDisappear(element, timeoutMs) {
        return new Promise((resolve, reject) => {
            const intervalTime = 1000;
            let elapsedTime = 0;

            const checkInterval = setInterval(() => {
                if (!isRunning) {
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }

                if (!document.contains(element)) {
                    clearInterval(checkInterval);
                    resolve();
                } else {
                    elapsedTime += intervalTime;
                    if (elapsedTime >= timeoutMs) {
                        clearInterval(checkInterval);
                        reject(new Error('Element did not disappear within the timeout.'));
                    }
                }
            }, intervalTime);
        });
    }

    // --------------------- Main Processing Function ---------------------

    /**
     * Scrolls up the chat window smoothly by a specified amount and returns a Promise that resolves when scrolling is complete.
     * @param {Element} scrollableContainer - The scrollable container element.
     * @param {number} distance - How many pixels to scroll (negative scrolls up, positive scrolls down).
     * @returns {Promise} - Resolves when scrolling is finished.
     */
    function scrollByDistance(scrollableContainer, distance) {
        if (scrollableContainer) {
            console.log(`Scrolling by ${distance} pixels...`);
            scrollableContainer.scrollBy({
                top: distance,
                behavior: 'smooth'
            });
            return waitForScrollToFinish(scrollableContainer);
        } else {
            return Promise.reject('Scrollable container not found.');
        }
    }

    /**
     * Processes user messages by scrolling to them, hovering, clicking "More", and unsending.
     * Continues scrolling up until the top of the chat is reached or the script is terminated.
     */
    async function processMessages() {
        let scrollableContainer = findScrollableContainer();

        if (!scrollableContainer) {
            console.log('Unable to identify the scrollable container. Exiting script.');
            isRunning = false;
            removeOverlay();
            return;
        }

        while (isRunning) { 
            console.log('--- New Scroll Cycle ---');

            const messageContainers = document.querySelectorAll(MESSAGE_CONTAINER_SELECTOR);

            if (messageContainers.length === 0) {
                console.log('No messages found with the specified classes and attributes.');
            } else {

                const messages = Array.from(messageContainers).reverse();

                for (let msg of messages) {

                    if (!isRunning) break;

                    if (processedMessages.has(msg)) {
                        continue;
                    }

                    if (isUserMessage(msg)) {

                        if (isUnsupportedMessage(msg)) {
                            console.log('Skipped an unsupported message:', msg);
                            processedMessages.add(msg); 
                            continue; 
                        }

                        processedMessages.add(msg);

                        console.log('Your message container found:', msg);

                        msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        console.log('Scrolled to your message.');

                        await waitForScrollToFinish(scrollableContainer);
                        console.log('Scrolling has finished.');

                        simulateMouseEvent(msg, 'mouseover');
                        simulateMouseEvent(msg, 'mouseenter');
                        simulateMouseEvent(msg, 'mousemove');
                        console.log('Simulated mouse hover on your message.');

                        await delay(1000);

                        const moreButtonClicked = await waitForMoreButton(msg);

                        if (!isRunning) break;

                        if (moreButtonClicked) {
                            const unsendSuccess = await findAndClickUnsendSvg();

                            if (!unsendSuccess) {
                                console.warn('Could not find "Unsend" SVG. Scrolling down by 1000 to re-scan...');
                                await scrollByDistance(scrollableContainer, 1000);
                                continue; 
                            } else {
                                try {
                                    await waitForElementToDisappear(msg, 60000);
                                    console.log('Message successfully unsent and removed from the DOM.');
                                } catch (error) {
                                    console.warn('Assuming rate limited. Waiting 3 minutes before retrying.');
                                    console.warn(error.message);
                                    await delay(180000);
                                    console.log('Resuming message processing after rate limit wait.');
                                }
                            }
                        } else {
                            console.warn('Could not find "More" button. Scrolling down by 1000 to re-scan...');
                            await scrollByDistance(scrollableContainer, 1000);
                            continue; 
                        }
                    } else {
                        processedMessages.add(msg);
                    }
                }
            }

            // Check if we reached the top
            if (checkViewProfile()) {
                console.log('Reached the top of the chat. No more messages to process.');
                break; 
            }

            try {
                await scrollByDistance(scrollableContainer, -100);
            } catch (error) {
                console.error(error);
                break;
            }
        }

        console.log('Script has been terminated.');
        removeOverlay();
    }

    processMessages();

})();
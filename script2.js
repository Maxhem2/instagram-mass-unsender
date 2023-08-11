let messageIndex = 0; // Store the index of the current message
let messages = []; // Store the list of messages to process

// Function to find all messages
function findAllMessages() {
    const messageElements = document.querySelectorAll('[aria-label="Double tap to like"]');
    messages = Array.from(messageElements);
}

// Function to check if the "More" button exists
function findMoreButton() {
    const moreButton = document.querySelector('[aria-label="More"][aria-expanded="false"][aria-haspopup="menu"]');
    return moreButton;
}

// Function to scroll to an element and dispatch the mouseover event
function scrollToElementAndDispatchEvent(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    });

    const mouseoverEvent = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    element.dispatchEvent(mouseoverEvent);
}

// Function to find the "Unsend" button in a message
function findUnsendButton() {
    const searchKeyword = "Unsend";
    const unsendButton = findLastElementWithText(searchKeyword);
    return unsendButton;
}

// Function to find the next button after clicking "Unsend"
function findNextButtonAfterUnsend() {
    const searchKeyword = "Unsend";
    const nextButton = findLastButtonWithText(searchKeyword);
    return nextButton;
}

// Function to wait for an element to be found
function waitForElement(element, callback, interval = 100) {
    const intervalId = setInterval(() => {
        if (element) {
            clearInterval(intervalId);
            callback();
        }
    }, interval);
}

// Function to process the next message
function processNextMessage() {
    if (messageIndex >= messages.length) {
        console.log('No more messages to process.');
        return;
    }

    const message = messages[messageIndex];

    scrollToElementAndDispatchEvent(message);

    setTimeout(() => {
        const moreButton = findMoreButton();
        if (moreButton) {
            setTimeout(() => {
                moreButton.click();
                setTimeout(() => {
                    const unsendButton = findUnsendButton();
                    if (unsendButton) {
                        console.log('Unsend button found.');
                        unsendButton.click();
                        setTimeout(() => {
                            const nextButton = findNextButtonAfterUnsend();
                            console.log('Next button found after Unsend.');
                            // Wait for the next button to be found
                            waitForElement(nextButton, () => {
                                nextButton.click();
                                // Wait for the click event to complete
                                setTimeout(() => {
                                    // Check if the message element still exists in the document
                                    if (!document.contains(message)) {
                                        console.log('Message deleted successfully.');
                                        messageIndex++;
                                        processNextMessage();
                                    }
                                    else {
                                        setTimeout(() => {
                                            console.log('Timeout finished, retrying.');
                                            processNextMessage();
                                        }, 300000)
                                    }
                                }, 1000); // Delay added to ensure the click event completes
                            });
                        }, 1000); // Delay added to ensure the click event completes
                    } else {
                        console.log('No Unsend button found for this message.');
                        // Scroll to the next newest message and process it
                        messageIndex++;
                        processNextMessage();
                    }
                }, 100); // Delay added to ensure the click event completes
            }, 100); // Delay added to ensure the scroll and mouseover events complete
        } else {
            console.log('No More button found for this message.');
            // Scroll to the next newest message and process it
            messageIndex++;
            processNextMessage();
        }
    }, 100); // Delay added to ensure the scroll and mouseover events complete
}

// Function to find an element with the specified text
function findLastElementWithText(keyword) {
    let lastElementWithText = null;
    const allElements = document.querySelectorAll('div');

    allElements.forEach(element => {
        const elementText = element.innerText || element.textContent;
        if (elementText.includes(keyword)) {
            lastElementWithText = element;
        }
    });

    return lastElementWithText;
}

// Function to find a button with the specified text
function findLastButtonWithText(keyword) {
    let lastButtonWithText = null;
    const allButtons = document.querySelectorAll('div button');

    allButtons.forEach(button => {
        const buttonText = button.innerText || button.textContent;
        if (buttonText.includes(keyword)) {
            lastButtonWithText = button;
        }
    });

    return lastButtonWithText;
}

// Start scrolling and finding messages
findAllMessages();

// Start processing messages
processNextMessage();
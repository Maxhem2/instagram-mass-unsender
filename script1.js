let lastMessageFound = null; // Store the last message element found

// Function to check if the "View profile" button exists
function findViewProfileButton() {
  const viewProfileButtons = document.querySelectorAll('a[role="link"][tabindex="0"]');
  
  for (const button of viewProfileButtons) {
    if (button.textContent.trim() === 'View profile') {
      return button;
    }
  }
  
  return null;
}

// Function to check if an element with the specified aria-label attribute exists
function findElementWithLabel() {
  const elementsWithLabel = document.querySelectorAll('[aria-label="Double tap to like"]');
  return elementsWithLabel.length > 0 ? elementsWithLabel[0] : null;
}

// Function to scroll up and find the next oldest message
function scrollAndFindNextOldest() {
  const viewProfileButton = findViewProfileButton();

  if (viewProfileButton) {
    console.log('Oldest message found.');
    return; // Stop scrolling
  }

  const targetElement = findElementWithLabel();

  if (!targetElement) {
    const viewProfileButtonAfterScroll = findViewProfileButton();
    if (viewProfileButtonAfterScroll) {
      console.log('Oldest message found.');
      return; // Stop scrolling
    } else if (lastMessageFound) {
      scrollAndFindNextOldest();
    } else {
      console.log('No messages found.');
    }
    return; // Stop scrolling
  }

  // Store the current message as the last one found
  lastMessageFound = targetElement;

  // Scroll to the target element
  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center'
  });

  // Call the function recursively without a delay to continue searching higher
  setTimeout(scrollAndFindNextOldest, 100); // Delay added to prevent rapid recursive calls
}

// Start scrolling and finding messages
scrollAndFindNextOldest();

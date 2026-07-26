// ==========================================================================
// Predefined List of Compliments
// ==========================================================================
const compliments = [
  "You have a contagious sense of enthusiasm that brightens every room.",
  "Your perspective and ideas bring so much value to those around you.",
  "You're a incredible listener and make people feel truly heard.",
  "Your creative energy is inspiring and refreshing.",
  "The world is genuinely better because you are in it.",
  "You handle challenging situations with remarkable grace and resilience.",
  "Your kindness is a powerful force that makes a real difference.",
  "You have a natural gift for making complex things feel approachable.",
  "Your dedication to growing and learning is truly commendable.",
  "You bring out the best qualities in the people around you."
];

// Variable to keep track of the previously selected index to avoid repetition
let lastIndex = -1;

// ==========================================================================
// DOM Elements
// ==========================================================================
const complimentDisplay = document.getElementById("compliment-text");
const generateBtn = document.getElementById("generate-btn");

// ==========================================================================
// Functions
// ==========================================================================

/**
 * Returns a random index from the array that is different from the last index.
 * @returns {number} Random index
 */
function getRandomIndex() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * compliments.length);
  } while (newIndex === lastIndex && compliments.length > 1);

  lastIndex = newIndex;
  return newIndex;
}

/**
 * Updates the display with a new compliment including a smooth fade animation.
 */
function displayNewCompliment() {
  // Step 1: Fade out the current text
  complimentDisplay.classList.add("fade-out");

  // Step 2: Wait for fade-out to complete before changing text and fading back in
  setTimeout(() => {
    const randomIndex = getRandomIndex();
    complimentDisplay.textContent = compliments[randomIndex];
    
    // Fade text back in
    complimentDisplay.classList.remove("fade-out");
  }, 300); // 300ms matches the CSS opacity transition duration
}

// ==========================================================================
// Event Listeners
// ==========================================================================

// Trigger a new compliment when the button is clicked
generateBtn.addEventListener("click", displayNewCompliment);
// ==========================================================================
// Predefined List of Compliments
// ==========================================================================
const compliments = [
  { id: "compliment-1", text: "You have a contagious sense of enthusiasm that brightens every room.", category: "encouraging" },
  { id: "compliment-2", text: "Your perspective and ideas bring so much value to those around you.", category: "thoughtful" },
  { id: "compliment-3", text: "You're an incredible listener and make people feel truly heard.", category: "kind" },
  { id: "compliment-4", text: "Your creative energy is inspiring and refreshing.", category: "creative" },
  { id: "compliment-5", text: "The world is genuinely better because you are in it.", category: "uplifting" },
  { id: "compliment-6", text: "You handle challenging situations with remarkable grace and resilience.", category: "strong" },
  { id: "compliment-7", text: "Your kindness is a powerful force that makes a real difference.", category: "kind" },
  { id: "compliment-8", text: "You have a natural gift for making complex things feel approachable.", category: "thoughtful" },
  { id: "compliment-9", text: "Your dedication to growing and learning is truly commendable.", category: "growth" },
  { id: "compliment-10", text: "You bring out the best qualities in the people around you.", category: "uplifting" }
];

const STORAGE_KEY = "compliment-favorites-v1";
const MAX_FAVORITES = 50;
let lastIndex = -1;
let currentCompliment = null;
let favorites = loadFavorites();
let statusTimeout;

// ==========================================================================
// DOM Elements
// ==========================================================================
const complimentDisplay = document.getElementById("compliment-text");
const generateBtn = document.getElementById("generate-btn");
const favoriteBtn = document.getElementById("favorite-btn");
const copyBtn = document.getElementById("copy-btn");
const shareBtn = document.getElementById("share-btn");
const favoritesToggleBtn = document.getElementById("favorites-toggle-btn");
const favoritesPanel = document.getElementById("favorites-panel");
const closeFavoritesBtn = document.getElementById("close-favorites-btn");
const favoritesList = document.getElementById("favorites-list");
const statusMessage = document.getElementById("status-message");

// ==========================================================================
// Helper Functions
// ==========================================================================

function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => item && typeof item.text === "string").slice(0, MAX_FAVORITES);
  } catch (error) {
    console.warn("Favorites could not be loaded:", error);
    return [];
  }
}

function saveFavorites() {
  try {
    const trimmedFavorites = favorites.slice(0, MAX_FAVORITES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedFavorites));
  } catch (error) {
    console.warn("Favorites could not be saved:", error);
  }
}

function normalizeText(value) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function escapeHTML(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setStatus(message) {
  statusMessage.textContent = message;
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusMessage.textContent = "";
  }, 2200);
}

// ==========================================================================
// Compliment Logic
// ==========================================================================

function getRandomIndex() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * compliments.length);
  } while (newIndex === lastIndex && compliments.length > 1);

  lastIndex = newIndex;
  return newIndex;
}

function isFavorite(text) {
  return favorites.some((item) => normalizeText(item.text) === normalizeText(text));
}

function updateFavoriteButtonState() {
  const favorited = currentCompliment ? isFavorite(currentCompliment.text) : false;
  favoriteBtn.classList.toggle("is-active", favorited);
  favoriteBtn.innerHTML = favorited ? "♥ Favorited" : "♡ Favorite";
  favoriteBtn.setAttribute("aria-pressed", favorited ? "true" : "false");
  favoriteBtn.setAttribute("aria-label", favorited ? "Remove this compliment from favorites" : "Favorite this compliment");
}

function renderFavoritesList() {
  if (!favorites.length) {
    favoritesList.innerHTML = '<li class="favorites-empty">No favorites yet. Save a compliment to see it here.</li>';
    return;
  }

  favoritesList.innerHTML = favorites
    .map(
      (item) => `
        <li class="favorites-item">
          <span class="favorites-item__text">${escapeHTML(item.text)}</span>
          <button class="favorites-item__remove" type="button" data-id="${item.id}" aria-label="Remove favorite">Remove</button>
        </li>
      `
    )
    .join("");
}

function displayNewCompliment() {
  complimentDisplay.classList.add("fade-out");

  setTimeout(() => {
    const randomIndex = getRandomIndex();
    currentCompliment = compliments[randomIndex];
    complimentDisplay.textContent = currentCompliment.text;
    complimentDisplay.classList.remove("fade-out");
    updateFavoriteButtonState();
  }, 300);
}

function openFavoritesPanel() {
  favoritesPanel.classList.add("is-open");
  favoritesPanel.setAttribute("aria-hidden", "false");
  renderFavoritesList();
}

function closeFavoritesPanel() {
  favoritesPanel.classList.remove("is-open");
  favoritesPanel.setAttribute("aria-hidden", "true");
}

function toggleFavorite() {
  if (!currentCompliment) {
    return;
  }

  const normalizedText = normalizeText(currentCompliment.text);
  const existingIndex = favorites.findIndex((item) => normalizeText(item.text) === normalizedText);

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    setStatus("Removed from favorites.");
  } else {
    favorites.unshift({
      id: `favorite-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      text: currentCompliment.text
    });
    favorites = favorites.slice(0, MAX_FAVORITES);
    setStatus("Added to favorites.");
  }

  saveFavorites();
  renderFavoritesList();
  updateFavoriteButtonState();
}

async function copyCurrentCompliment() {
  if (!currentCompliment) {
    return;
  }

  const textToCopy = currentCompliment.text;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      setStatus("Copied to clipboard.");
      return;
    }

    throw new Error("Clipboard API unavailable");
  } catch (error) {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;
    tempTextArea.setAttribute("readonly", "");
    tempTextArea.style.position = "fixed";
    tempTextArea.style.left = "-9999px";
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
    setStatus("Copied to clipboard.");
  }
}

async function shareCurrentCompliment() {
  if (!currentCompliment) {
    return;
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Compliment",
        text: currentCompliment.text
      });
      setStatus("Shared successfully.");
      return;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      setStatus("Share cancelled.");
      return;
    }
  }

  await copyCurrentCompliment();
  setStatus("Sharing is not supported here, so I copied it for you.");
}

// ==========================================================================
// Event Listeners
// ==========================================================================

generateBtn.addEventListener("click", displayNewCompliment);
favoriteBtn.addEventListener("click", toggleFavorite);
copyBtn.addEventListener("click", copyCurrentCompliment);
shareBtn.addEventListener("click", shareCurrentCompliment);
favoritesToggleBtn.addEventListener("click", openFavoritesPanel);
closeFavoritesBtn.addEventListener("click", closeFavoritesPanel);
favoritesPanel.addEventListener("click", (event) => {
  if (event.target.matches("[data-close='true']")) {
    closeFavoritesPanel();
  }
});
favoritesList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("button[data-id]");
  if (!removeButton) {
    return;
  }

  const idToRemove = removeButton.getAttribute("data-id");
  favorites = favorites.filter((item) => item.id !== idToRemove);
  saveFavorites();
  renderFavoritesList();
  updateFavoriteButtonState();
  setStatus("Removed from favorites.");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFavoritesPanel();
  }
});

// Show an initial compliment on load
currentCompliment = compliments[getRandomIndex()];
complimentDisplay.textContent = currentCompliment.text;
updateFavoriteButtonState();
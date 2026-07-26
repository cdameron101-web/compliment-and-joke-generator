// ==========================================================================
// Predefined Content
// ==========================================================================
const compliments = [
  { id: "compliment-1", type: "compliment", text: "You have a contagious sense of enthusiasm that brightens every room.", category: "encouraging" },
  { id: "compliment-2", type: "compliment", text: "Your perspective and ideas bring so much value to those around you.", category: "thoughtful" },
  { id: "compliment-3", type: "compliment", text: "You're an incredible listener and make people feel truly heard.", category: "kind" },
  { id: "compliment-4", type: "compliment", text: "Your creative energy is inspiring and refreshing.", category: "creative" },
  { id: "compliment-5", type: "compliment", text: "The world is genuinely better because you are in it.", category: "uplifting" },
  { id: "compliment-6", type: "compliment", text: "You handle challenging situations with remarkable grace and resilience.", category: "strong" },
  { id: "compliment-7", type: "compliment", text: "Your kindness is a powerful force that makes a real difference.", category: "kind" },
  { id: "compliment-8", type: "compliment", text: "You have a natural gift for making complex things feel approachable.", category: "thoughtful" },
  { id: "compliment-9", type: "compliment", text: "Your dedication to growing and learning is truly commendable.", category: "growth" },
  { id: "compliment-10", type: "compliment", text: "You bring out the best qualities in the people around you.", category: "uplifting" }
];

const jokes = [
  { id: "joke-1", type: "joke", setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything." },
  { id: "joke-2", type: "joke", setup: "What do you call fake spaghetti?", punchline: "An impasta." },
  { id: "joke-3", type: "joke", setup: "How do you organize a space party?", punchline: "You planet." },
  { id: "joke-4", type: "joke", setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field." },
  { id: "joke-5", type: "joke", setup: "What did one wall say to the other wall?", punchline: "I'll meet you at the corner." }
];

const STORAGE_KEY = "compliment-favorites-v1";
const MAX_FAVORITES = 50;
let lastIndices = { compliment: -1, joke: -1 };
let currentMode = "compliment";
let currentItem = null;
let favorites = loadFavorites();
let statusTimeout;

// ==========================================================================
// DOM Elements
// ==========================================================================
const contentDisplay = document.getElementById("content-text");
const punchlineDisplay = document.getElementById("punchline-text");
const generateBtn = document.getElementById("generate-btn");
const favoriteBtn = document.getElementById("favorite-btn");
const copyBtn = document.getElementById("copy-btn");
const shareBtn = document.getElementById("share-btn");
const favoritesToggleBtn = document.getElementById("favorites-toggle-btn");
const favoritesPanel = document.getElementById("favorites-panel");
const closeFavoritesBtn = document.getElementById("close-favorites-btn");
const favoritesList = document.getElementById("favorites-list");
const statusMessage = document.getElementById("status-message");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));

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

    return parsed.filter((item) => item && (typeof item.text === "string" || typeof item.setup === "string")).slice(0, MAX_FAVORITES);
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

function getItemsForMode(mode) {
  return mode === "joke" ? jokes : compliments;
}

function getRandomIndex(mode) {
  const items = getItemsForMode(mode);
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * items.length);
  } while (newIndex === lastIndices[mode] && items.length > 1);

  lastIndices[mode] = newIndex;
  return newIndex;
}

function getDisplayText(item) {
  return item.type === "joke" ? item.setup : item.text;
}

function getShareText(item) {
  if (item.type === "joke") {
    return `${item.setup}\n${item.punchline}`;
  }
  return item.text;
}

function getFavoriteLabel(item) {
  return item.type === "joke" ? `${item.setup} — ${item.punchline}` : item.text;
}

function isFavorite(item) {
  return favorites.some((favorite) => {
    const currentText = normalizeText(getFavoriteLabel(item));
    const favoriteText = normalizeText(getFavoriteLabel(favorite));
    return currentText === favoriteText;
  });
}

function updateFavoriteButtonState() {
  const favorited = currentItem ? isFavorite(currentItem) : false;
  favoriteBtn.classList.toggle("is-active", favorited);
  favoriteBtn.innerHTML = favorited ? "&#10084; Favorited" : "&#10084; Favorite";
  favoriteBtn.setAttribute("aria-pressed", favorited ? "true" : "false");
  favoriteBtn.setAttribute("aria-label", favorited ? "Remove this item from favorites" : "Favorite this item");
}

function renderFavoritesList() {
  if (!favorites.length) {
    favoritesList.innerHTML = '<li class="favorites-empty">No favorites yet. Save a little pick-me-up to see it here.</li>';
    return;
  }

  favoritesList.innerHTML = favorites
    .map(
      (item) => `
        <li class="favorites-item">
          <span class="favorites-item__text">${escapeHTML(getFavoriteLabel(item))}</span>
          <button class="favorites-item__remove" type="button" data-id="${item.id}" aria-label="Remove favorite">Remove</button>
        </li>
      `
    )
    .join("");
}

function displayCurrentItem() {
  contentDisplay.classList.add("fade-out");

  setTimeout(() => {
    contentDisplay.textContent = getDisplayText(currentItem);
    punchlineDisplay.textContent = currentItem.type === "joke" ? currentItem.punchline : "";
    punchlineDisplay.hidden = currentItem.type !== "joke";
    contentDisplay.classList.remove("fade-out");
    updateFavoriteButtonState();
  }, 300);
}

function generateNextItem() {
  const items = getItemsForMode(currentMode);
  const randomIndex = getRandomIndex(currentMode);
  currentItem = items[randomIndex];
  displayCurrentItem();
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  const introMessage = mode === "joke"
    ? "Click the button below to hear a joke!"
    : "Click the button below to receive your compliment!";

  contentDisplay.textContent = introMessage;
  punchlineDisplay.textContent = "";
  punchlineDisplay.hidden = true;
  updateFavoriteButtonState();
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
  if (!currentItem) {
    return;
  }

  const existingIndex = favorites.findIndex((favorite) => normalizeText(getFavoriteLabel(favorite)) === normalizeText(getFavoriteLabel(currentItem)));

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    setStatus("Removed from favorites.");
  } else {
    favorites.unshift({
      id: `favorite-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      ...currentItem
    });
    favorites = favorites.slice(0, MAX_FAVORITES);
    setStatus("Added to favorites.");
  }

  saveFavorites();
  renderFavoritesList();
  updateFavoriteButtonState();
}

async function copyCurrentItem() {
  if (!currentItem) {
    return;
  }

  const textToCopy = getShareText(currentItem);

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

async function shareCurrentItem() {
  if (!currentItem) {
    return;
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: currentItem.type === "joke" ? "Joke" : "Compliment",
        text: getShareText(currentItem)
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

  await copyCurrentItem();
  setStatus("Sharing is not supported here, so I copied it for you.");
}

// ==========================================================================
// Event Listeners
// ==========================================================================

generateBtn.addEventListener("click", generateNextItem);
favoriteBtn.addEventListener("click", toggleFavorite);
copyBtn.addEventListener("click", copyCurrentItem);
shareBtn.addEventListener("click", shareCurrentItem);
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
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
    generateNextItem();
  });
});

// Initial load
setMode(currentMode);
currentItem = compliments[getRandomIndex(currentMode)];
displayCurrentItem();
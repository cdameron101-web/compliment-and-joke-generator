# Compliment & Joke Generator

A lightweight web app that serves up uplifting compliments and light jokes with a polished, simple interface. Users can switch between content types, favorite items, copy them to the clipboard, and share them.

## Features

- Generate compliments or jokes
- Toggle between content modes
- Save favorites in local storage
- Copy or share the current item
- Responsive layout for desktop and mobile

## Files

- `index.html` – app structure and controls
- `style.css` – styling for the card, buttons, and favorites panel
- `script.js` – content generation, favorites, copy/share behavior
- `favicon.svg` – app icon

## Run locally

Open `index.html` in a browser, or serve the folder with a simple local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. Open the repository settings.
3. Under Pages, choose the main branch and the root folder.
4. Save the settings and wait for the site to publish.

## Notes

Favorites are stored in the browser using local storage, so they persist across visits on the same device.

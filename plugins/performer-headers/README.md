# D67 Stash Plugins

## Performer Headers

Enhance your Stash performer pages with a dynamic header showcasing random screenshots from the performer's scenes.

Performer Headers adds a visually rich image strip to the top of every performer page, helping you quickly browse a performer's content without having to scroll through scene lists.

# Features

✅ Displays a curated row of random scene screenshots on performer pages

✅ Click any image to jump directly to that scene

✅ Hover over an image to view the scene title

✅ Intelligent image selection for improved variety

✅ Fast in-memory caching for excellent performance

✅ Fully compatible with Stash's SPA navigation

✅ Lightweight and requires no external services

## Screenshot
<img width="1921" height="697" alt="Screenshot 2026-06-25 at 08 52 27" src="https://github.com/user-attachments/assets/ffb5bb49-562a-4717-833a-900bf8f320fa" />


## Installation

Manual Installation

Download or clone this repository.
Copy the performer-headers folder into your Stash plugins directory.

Example:

Stash/
└── plugins/
    └── performer-headers/
        ├── performer-headers.js
        ├── performer-headers.yml
        └── README.md

Open Stash.
Navigate to Settings → Plugins.
Reload plugins.
Open any performer page.

## How It Works

When viewing a performer, Performer Headers:

Retrieves scenes associated with that performer.
Selects a diverse set of screenshots.
Displays them in a responsive header strip.
Caches results for fast navigation between performers.

The header remains visible while browsing performer tabs such as:

Scenes
Galleries
Movies
Details

without requiring additional page refreshes.

## Compatibility

Tested with:

Stash v0.31.x

Modern browsers:

Chrome
Edge
Firefox
Brave

## Performance

Performer Headers was designed to be lightweight and responsive.

Performance optimizations include:

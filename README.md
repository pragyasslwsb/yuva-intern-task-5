# Northstar — Weekend Getaway SPA

## Project overview

Northstar is a small single-page application (SPA) for discovering weekend getaways. I built it to practise connecting HTML, CSS, and JavaScript into one working interface: users can explore places, filter results, open a detail page, and save favourites without a full page reload.

The project is deliberately dependency-free. Its destination data and original SVG illustrations are included locally, which makes the demo easy to inspect and run.

## Run it

**Requirements:** Node.js 18 or newer. There are no third-party runtime dependencies.

```text
npm start
```

Open <http://127.0.0.1:4173> in a browser. Keep the terminal running while you use the application. The bundled `server.js` serves the project locally. To use a different port in PowerShell, run `$env:PORT = 5000; npm start`, then open <http://127.0.0.1:5000>.

The app can also be hosted as static files at the site root. Query-string routes avoid needing server-side route rewrites.

## Quick walkthrough

1. Choose **Explore getaways**, enter `Big Sur`, select **Coast**, and submit. The URL becomes `?page=explore&q=Big+Sur&category=Coast`; Salt House is the one matching result.
2. Open **Salt House**. The URL becomes `?page=destination&id=salt-house`; browser Back returns to the search, and Forward returns to the detail.
3. Select the heart. The saved count changes from `0` to `1`; **Saved** shows the place. Refresh to see the saved state restored from browser storage.
4. Search for `Antarctica` to see the zero-results state, or open `?page=destination&id=not-a-place` to see the not-found page.
5. Use the keyboard to navigate the links and controls. Resize the browser to see the layout switch at the 800 px and 560 px breakpoints.

Explore has four non-default filters—Cabin, Coast, Desert, and Mountain—and matches the search text against a stay's name, location, and category.

## Project map

```text
northstar-spa/
├── index.html               Accessible SPA shell and shared chrome
├── styles.css               Responsive design, transitions, reduced-motion rules
├── app.js                   Sample data, query router, views, search, saved state
├── server.js                Dependency-free local static-file server
├── package.json             Start command
├── README.md                Setup and quick-start examples
├── technical-report.md      Architecture, decisions, challenges, test plan
└── assets/                  Locally bundled SVG illustrations and favicon
```

All destination descriptions and prices are illustrative demo data. There is no booking backend, payment processing, account system, or external image request.

## Submission notes

The technical report explains the route design, state management, implementation challenges, and validation checklist. The inline code comments are kept brief and focus on the less-obvious decisions, such as URL routing and event delegation.

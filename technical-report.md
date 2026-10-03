# Northstar SPA — Technical Report

**Project type:** Front-end internship task  
**Technologies:** HTML, CSS, JavaScript, Node.js (local development server)  
**Application:** Northstar weekend getaway finder

## Summary

For this project, I built a small SPA that lets a visitor browse six sample weekend getaways without loading a new document for each page. It has five named views (Home, Explore, Destination, Saved, and About), plus a friendly fallback for unknown routes. The main learning goal was to connect the URL, browser history, rendered content, and saved-item state so they behave as one application. I kept the project framework-free so the routing and DOM updates are visible in the source code.

## 1. Project plan

**Objective.** Build a small but complete single-page travel-discovery application that demonstrates dynamic rendering, client-side routes, browser history, durable state, useful empty/error states, and a polished responsive interface.

**Audience and concept.** Northstar is a friendly directory of nearby weekend escapes. The tone and compact destination listings keep the example concrete: users can explore stays, search and filter the directory, read a detail, and save places for later.

**Implementation sequence.**

1. Define a semantic HTML shell with shared navigation, main content, footer, live announcements, and a keyboard skip link.
2. Create one source of truth for sample destination records and reusable, escaped card rendering.
3. Add a query-string router backed by `history.pushState` and `popstate` so the URL, rendered view, and browser controls remain in sync.
4. Implement search/filter state in route parameters and saved trips in `localStorage`.
5. Style each view responsively, add restrained transitions, and honor reduced-motion preferences.
6. Exercise direct links, refresh, search, save/unsave, history navigation, no-results, and invalid routes.

## 2. Architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Persistent application shell, landmarks, accessible live regions, and CSS/JS entry points. |
| `styles.css` | Design tokens, layout and card styles, responsive breakpoints, focus states, motion, reduced-motion support. |
| `app.js` | Sample data, URL parsing/building, page rendering, navigation interception, form handling, saved-trip state, and user feedback. |
| `server.js` | Optional zero-dependency local static server for a reliable HTTP origin during development. |
| `assets/*.svg` | Hand-authored, locally bundled illustrations; no image API or network is needed. |

The app uses a lightweight render-on-navigation pattern rather than a framework. The persistent shell stays mounted; the `#app` region is regenerated from the current route and in-memory state. One delegated click handler handles internal links and save buttons, and one submit handler handles the search form. This keeps event wiring stable when the view is re-rendered. Brief comments in the source call out these key decisions without restating each line of code.

### Route table

| URL | View | Route data |
| --- | --- | --- |
| `/?page=home` | Home and featured stays | None |
| `/?page=explore` | Searchable/filterable directory | `q`, `category` |
| `/?page=destination&id=cedar-house` | Destination detail | `id` |
| `/?page=saved` | Saved-trip shortlist | Saved IDs in local storage |
| `/?page=about` | Project/story page | None |
| Any unknown page or destination ID | Friendly not-found view | Invalid route |

The default route is home. Query parameters are parsed with `URLSearchParams`; generated internal links use the same route builder. `pushState` changes the address and appends a history entry without reloading, while the `popstate` listener redraws the correct view on browser Back and Forward. Search terms and category selection are URLs, not hidden transient state, so they survive refresh and can be shared.

For example, submitting the search term `coast` with the category set to `Anywhere` produces `/?page=explore&q=coast&category=All`. Opening Salt House then creates a separate history entry at `/?page=destination&id=salt-house`. Back returns to the filtered Explore route; Forward returns to the detail. A direct refresh of either URL re-renders that route because the view is derived from the current query string.

### State model

- **Navigation and filters:** encoded in `window.location.search`; the URL is the source of truth.
- **Saved stays:** a set of valid destination IDs, hydrated from `localStorage` and written back after each change.
- **View markup:** derived from the current route and state; it is not separately persisted.
- **Transient feedback:** announced in a shared status region and dismissed automatically.

Malformed stored data is reported to the console and falls back to an empty shortlist for the current visit. Storage write failures are also reported and explained to the user; the current-session shortlist continues to work in memory.

### Interactive feature implementation

**Client-side navigation.** Internal anchors keep real `href` values so they remain copyable and keyboard-usable. A delegated document-level click handler intercepts only ordinary, same-origin clicks. It leaves modified clicks (for example, Ctrl-click), downloads, and links to other origins to the browser. For an eligible click, `navigate()` calls `history.pushState()`, re-renders from the URL, moves keyboard focus to the main region, and scrolls to the top. The `popstate` listener handles Back and Forward, which change the URL without passing through `navigate()`.

**Search and category filters.** The Explore form uses a search input and a native select with four categories: Cabin, Coast, Desert, and Mountain. On submit, the handler reads the form with `FormData`, trims the search text, and puts both values into the query string. `explorePage()` compares the query against each stay’s name, location, and category, then applies the selected category as a second condition. For example, selecting Coast and searching `Big Sur` should show one card—Salt House; searching `Antarctica` should show zero cards and a clear-filters link. The page announces the result count through a live region.

**Saved trips.** A `Set` provides fast add/remove checks for destination IDs. On startup, the app parses `northstar-saved` from local storage and discards IDs that do not match the six known records. Clicking a heart toggles that ID, writes the updated set to storage, and re-renders the cards and header count. `aria-pressed` and the button’s accessible label describe the new state. For example, saving Salt House changes the header count from `0` to `1`; visiting Saved shows its card, and a refresh restores it from storage. Removing the only saved item returns the Saved view to its empty state and changes the count to `0`.

**Feedback and failure states.** A single polite status region provides transient save/storage messages; each toast is dismissed after 2,600 ms. Invalid destination IDs render the not-found view rather than a blank page. No search matches render an explanatory message and a link that clears the filters. Local-storage exceptions are logged and accompanied by user-facing feedback; in-memory saving can continue for the current visit.

## 3. Design decisions and rationale

- **Query-string routes instead of nested paths:** each screen can be refreshed or opened directly on a basic static host without special rewrite configuration. Example: `/?page=destination&id=salt-house`.
- **No framework or dependency install:** this small demo stays easy to inspect and run. The reusable data-driven templates provide structure without unnecessary setup.
- **Local SVG artwork:** original illustrations make the ZIP self-contained, quick to load, and usable offline. There are no external image or font requests required by the app; system font fallbacks keep typography available offline.
- **One destination data list:** home, explore, detail, and saved views share the same six sample records, reducing inconsistencies.
- **Native links and forms:** anchors have real URLs, the search form is keyboard-submittable, and modified clicks retain normal browser behavior.
- **Accessible interaction:** semantic navigation/main/footer landmarks, skip link, visible focus, button labels and pressed state, descriptive image text, live result/status regions, and reduced-motion handling.
- **Responsive layout:** cards and details adapt from three columns to two at 800 px and to one column at 560 px; mobile navigation and forms reflow for small screens.
- **Measured scope:** the home page features 3 of the 6 sample stays; Explore offers 4 non-default categories; the toast timeout is 2,600 ms. These values are visible in the implementation and make the example behaviors reproducible.

## 4. Implementation challenges and approaches

### Keeping URL and UI state synchronized

Changing markup alone would leave stale URLs and make Back/Forward unreliable. Every internal route is represented in the query string, navigation uses `pushState`, and `popstate` re-renders from the current URL. Search and filters are serialized into the route, so the same view returns after refresh.

### Safe, reliable rendering

Destination records are interpolated into HTML templates. A small HTML-escaping helper protects all user-controlled or data-derived text and attributes before insertion. Search terms are compared as text and are never treated as HTML. Invalid IDs and unknown routes intentionally resolve to a visible not-found screen.

### Persistence without a backend

This demo has no account or database, so saved IDs are stored locally in the visitor’s browser. The app validates stored data against the known destination list. Read/write failures are not silently mistaken for successful persistence: the console records the error and the UI explains the session-only behavior.

### Reliable local execution

The History API requires a same-origin browsing context; opening the HTML directly from disk is not a dependable development setup. The included dependency-free `server.js` supplies that context and a single `npm start` command. Since routes only change the query string, static hosting does not need an SPA rewrite rule.

### Motion and user preferences

Page and card transitions are deliberately short and subtle. A `prefers-reduced-motion` media query suppresses nonessential motion for visitors who have requested less animation.

## 5. Examples and expected behavior

These examples also work as a short manual demonstration of the app.

**Search and filter flow**

1. Visit `/?page=explore`.
2. Enter `Big Sur`, choose **Coast**, and submit.
3. The expected URL is `/?page=explore?q=Big+Sur&category=Coast`; the expected result count is **1**, with Salt House shown.
4. Refresh: the URL still contains the filters, so the same result is derived again.
5. Replace the search with `Antarctica`: the expected result count is **0**, with a clear-filters action.

**History flow**

1. Open `/?page=explore?q=coast&category=All` and then select Salt House.
2. Confirm the URL changes to `/?page=destination&id=salt-house`.
3. Select browser Back: the filtered Explore route and search input return.
4. Select Forward: Salt House’s detail content and title return.

**Saved-place flow**

1. Start with an empty list; the header displays `0`.
2. Save Salt House from its card; the button reports pressed, and the header displays `1`.
3. Open Saved; one Salt House card appears. Refresh and reopen Saved; the item remains.
4. Remove Salt House; the count returns to `0` and the empty-state message appears.

**Error/empty flows**

- `/?page=destination&id=missing-place` sets the title to `Place not found — Northstar` and displays a recovery link.
- Search `Antarctica` displays a no-results message and a clear-filters action.
- If local storage is denied, saving is described as session-only rather than being presented as durable.

## 6. Validation checklist

| Check | Expected result |
| --- | --- |
| Load home | Header, featured cards, and footer render with no page reload. |
| Internal navigation | Address changes; browser document does not reload. |
| Back and Forward | Correct view is restored from the URL. |
| Search and category filter | Result count/list reflect filters; query survives refresh. |
| Save, remove, refresh | Button/count/list update and valid saved IDs persist. |
| Empty search and invalid detail | Helpful empty/not-found screens appear. |
| Narrow viewport | Layout reflows without horizontal overflow. |
| Keyboard navigation | Skip link, navigation, search, cards, and actions are reachable and visibly focused. |
| Reduced motion | Nonessential page/card motion is minimized. |
| Offline assets | Illustrations load from the project’s own `assets/` folder. |

### Verification performed

I used Node’s syntax checker on both JavaScript files, checked the local HTTP server, and exercised the main flows in a browser. The following table records what I verified and the concrete result; it does not claim automated test-suite coverage.

| # | Test | Observed result |
| --- | --- | --- |
| 1 | Run `node --check app.js` and `node --check server.js` | Both syntax checks passed. |
| 2 | Request `/`, a query-string route, and `/assets/hero.svg` from the local server | All three returned HTTP `200`. |
| 3 | Load the home page | Northstar title, shared navigation, and 3 featured cards rendered. |
| 4 | Search for `coast` in Explore | URL became `?page=explore&q=coast&category=All`; result count was 1 and Salt House was shown. |
| 5 | Open Salt House, then use browser Back | Detail route rendered; Back restored the filtered search URL and result. |
| 6 | Save Salt House | Header count changed from 0 to 1; button state and label changed to saved. |
| 7 | Open Saved and reload/reopen the route | Salt House remained listed from local storage. |
| 8 | Remove the only saved stay from Saved | Header count returned to 0 and the empty-list message appeared. |
| 9 | Search `Antarctica` | Result count was 0 and the clear-filters link appeared. |
| 10 | Open `/?page=destination&id=not-a-place` | Not-found message and recovery link rendered; document title identified the invalid place. |
| 11 | Inspect the generated ZIP | All 15 expected project files/assets were present. |

I also checked the implementation for the four category options, the 800 px and 560 px responsive breakpoints, reduced-motion CSS, visible focus styling, and the 2,600 ms toast timeout. These are source-level checks, not measurements from a formal accessibility or responsive test suite. I did not run a performance benchmark or automated end-to-end suite.

## 7. Scope and limitations

This is a frontend simulation, not a booking service: prices, ratings, availability, traveler counts, and destination descriptions are illustrative. There is no live inventory, search API, login, payment flow, server-side persistence, or actual reservation action. Saved trips are scoped to one browser profile/device and are not synchronized across devices. A real product would replace the sample array and local storage with validated API responses, add loading/retry states and authentication as needed, and include end-to-end tests against the production host.

## 8. Delivery contents

The ZIP archive contains the complete runnable project: the HTML shell, CSS, JavaScript, package manifest, local server, README, this report, and all local SVG assets. No `node_modules`, build output, or external services are required.

## 9. Internship reflection

The main challenge was making navigation feel like a normal website while still avoiding full page reloads. I learned that updating the visible content is only part of routing: the URL and browser history also need to stay in sync. Storing the search term in the URL made the results refreshable and shareable, while handling the `popstate` event made Back and Forward work as expected.

I also learned to plan for failure states early. Browser storage can be unavailable, a search can have no matches, and a user can open an invalid destination link. Showing a clear message for each case made the demo feel more complete than only testing its happy path.

If I continued this project, I would connect it to a real destination API, add automated browser tests, and replace local-only saved trips with account-backed storage. Prices and destination details in this version are sample content, not live booking information.

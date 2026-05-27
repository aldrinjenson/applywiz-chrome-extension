# ApplyWiz — Chrome Extension

> Auto-apply to LinkedIn "Easy Apply" jobs while you watch it happen.

ApplyWiz is a Manifest V3 Chrome extension that drives the LinkedIn Easy Apply
flow end to end: it searches with your filters, walks the multi-step
application modal, fills the fields it can, submits, and moves on to the next
job — all in the open tab, in front of you. It's the browser half of the larger
ApplyWiz product (a web app dashboard + Supabase backend); this repo is the
extension.

Launched on [Product Hunt](https://www.producthunt.com/) on **Aug 17, 2023**.
Built Jun–Sep 2023 over ~99 commits.

> **Disclaimer:** Automating LinkedIn almost certainly violates its Terms of
> Service. This is shared as a past technical project / engineering case study,
> not an actively maintained or endorsed service. Read the code, learn from the
> DOM-automation patterns, but don't expect a working product against today's
> LinkedIn — the selectors below were valid in 2023 and LinkedIn's markup shifts
> constantly. That impermanence is exactly what made this interesting to build.

---

## Why this was hard

There is no LinkedIn Easy Apply API. The entire application flow is an
undocumented, lazily-rendered React SPA that changes its DOM whenever LinkedIn
feels like it. Every job is a different modal: some are one click, some are
seven pages of questions about years of experience, work authorization, salary
expectations, and checkboxes you must tick to agree to terms.

So the whole extension is **DOM choreography** — reverse-engineered selectors,
event dispatching that React will actually believe, and a state machine that
knows when a form is stuck, looping, or genuinely unanswerable. That's the
interesting part of this codebase, and the sections below call out the pieces by
name.

---

## Architecture

Three URL-scoped content scripts + one background service worker, wired together
with a typed message-passing protocol over `chrome.runtime` and a small
Redux-style store living in the background.

```
                ┌─────────────────────────────────────────────┐
                │  background service worker (background/)      │
                │   • Redux-style store: store.ts + reducer.ts  │
                │   • Supabase auth + session rehydration       │
                │   • batch job writes to Supabase              │
                │   • chrome.notifications                      │
                └───────────────▲───────────────────▲──────────┘
                                │ message protocol  │
       ┌────────────────────────┴───┐  ┌────────────┴────────────────┐
       │ contentScript.js           │  │ popup.ts / options.ts        │
       │  (linkedin.com/jobs/search)│  │  (UI: filters, prefs, login) │
       │   • applyToJobs state mach.│  └──────────────────────────────┘
       │   • autofill cascade       │
       ├────────────────────────────┤
       │ linkedInProfileContent.js  │  (linkedin.com/*/*)
       │ linkedInJobSettings.js     │  (jobs/application-settings)
       └────────────────────────────┘
```

### Content scripts (URL-scoped, from `static/manifest.json`)

| Script | Matches | Job |
|---|---|---|
| `contentScript.js` | `linkedin.com/jobs/search/*` | the main act — applies the filters, runs the automation loop |
| `linkedInProfileContent.js` | `linkedin.com/*/*` | reads profile context |
| `linkedInJobSettings.js` | `linkedin.com/jobs/application-settings/` | application-settings page hooks |

### The store (`src/background/store.ts` + `src/background/reducer.ts`)

A hand-rolled Redux clone living in the service worker: `getState`, `dispatch`,
`subscribe`/`unsubscribe`, `notifyListeners`, and a pure `reducer(state, action,
data)`. State holds the Supabase `user`, `userPrefs`, `automationStatus`, and
`extensionVersion`. Everything that crosses a script boundary is a typed
`Message { action, data }` (see `src/types.ts`) keyed off ~15 action constants
in `src/constants.ts` — `START_AUTOMATION`, `SET_USER`, `ADD_JOBS_TO_DB`,
`SET_AUTOMATION_STATUS`, `GET_FILTERS`, `RECEIVE_RESUMES`, and so on. The
background `onMessage` listener is the single switchboard for all of them.

### Auth + persistence (`src/services/supabase.ts`, `suapbaseUtils.ts`, `src/background/index.ts`)

Supabase email/password sign-in. Because MV3 service workers are killed and
restarted constantly, the session is the source of truth, not memory:
`onAuthStateChange` writes the session to `chrome.storage` on `SIGNED_IN`,
clears it on `SIGNED_OUT`, and on `INITIAL_SESSION` rehydrates by reading
`sb_session` back out of storage and calling `setSession` (falling back to
`refreshSession` if the access token is stale). `getFullUser` enriches the auth
user with subscription status from a `profile_view`. Applied jobs are
batch-written to a `jobs` table.

---

## The automation, in detail

### `waitForElement` — the primitive everything stands on (`src/utils.ts`)

You cannot `querySelector` a React SPA and expect the element to be there. So
nearly every interaction goes through:

```ts
waitForElement({ selector, params: { timeout, all, rootEl } })
```

It polls every **75ms** until the element exists or the timeout fires, resolving
the node (or `null`). `all` returns every match; `rootEl` scopes the search to a
subtree (used heavily to look *inside* a single form-field wrapper). This one
helper is what turns a flaky, race-prone SPA into something you can script
deterministically.

### `applyToJobs` — the modal state machine (`src/content_script/scraper.ts`)

The main loop. For each job card in the results list it:

1. Clicks the card, then **detects already-applied** jobs (and bumps the target
   count so they don't eat into your quota) and **skips external-apply** jobs
   (detected by the `link-external` icon on the Apply button).
2. Opens the Easy Apply modal and walks it, capped at **7 pages** so a broken
   form can never loop forever.
3. On each page it distinguishes the next action purely by `aria-label` —
   `"Continue to next step"` → `"Review your application"` → `"Submit
   application"` — advancing the selector as it goes.
4. Reads LinkedIn's **completeness progress meter** (`getMaxProgressValue`); if
   the reported progress exceeds 100% the form is stuck/looping, so it dismisses
   the modal, discards the application, and **retries the job** (`i--`).
5. Selects the right resume by name, calls the autofill cascade, and on the
   final step submits — then watches for a submit **error toast** and retries if
   one appears.

Results are bucketed into `successfullJobs` / `failedJobs` / `skippedJobs` /
`alreadyAppliedJobs`, and successes are flushed to the DB through a small
sliding window so writes are batched rather than one-per-job.

### `handleAnyUnfilledColumns` — the intelligent autofill cascade (`src/content_script/scraper_utils.ts`)

This is the brains. It finds every error-flagged field
(`li-icon[type="error-pebble-icon"]`), walks up to each field's wrapper, reads
the `<label>`, and tries to answer it in **priority order**:

1. **Resume errors** — skipped (handled separately by name selection).
2. **Checkboxes / terms** — auto-ticks "Yes" and "agree terms" labels.
3. **Experience fields** — matches the label against a per-skill
   experience map (`user.experience["react"] = 5`), falling back to a
   `generalExp` default.
4. **User-defined "advanced tags"** — author-configured rules where *all* tags
   in a row must appear in the label to fill its value (e.g. tags `["notice",
   "period"]` → `"30 days"`).
5. **Generic profile keys** — any top-level key on the user object whose name
   appears in the label.
6. **Select dropdowns** — falls back to the first real option (skipping a
   "none" placeholder).

Every fill dispatches a native `input`/`change` `Event` with `{ bubbles: true }`
so React's synthetic event system actually registers the value — setting
`input.value` alone is invisible to React. If a field exhausts every strategy,
the job is **gracefully discarded** with a recorded reason
(`"Cannot answer Input field: …"`) rather than submitted half-filled or left
hanging.

### Robustness odds and ends

- **Lazy-load scrolling** (`fetchAllJobsInCurrPage`) — scrolls the results
  column up to 7 times, watching for the page footer, to force LinkedIn to
  render every job card before scraping.
- **Pagination** (`moveToNextPage`) — reads the `artdeco-pagination`
  indicators, finds the current page, and advances; returns `false` when there's
  nowhere left to go.
- **Error-toast detection + retry** (`handleErrorToastWhileSubmitting`) — catches
  the "error while submitting" toast, dismisses it, discards the application, and
  retries the job.
- **Discard-and-retry** plumbing — shared logic for closing a stuck modal via
  the `Dismiss` button and confirming the discard dialog.

---

## Stack

- **TypeScript** + **Webpack 5**, seven entry points (one per content script /
  page) bundled to `dist/`
- **Manifest V3** (service worker background)
- **Sass** via `sass-loader` + `mini-css-extract-plugin`
- **Supabase JS** for auth + Postgres
- **Mocha** + **c8** coverage, with **sinon-chrome** mocking the `chrome.*` APIs
  so storage logic is testable off-browser
- **Husky** pre-commit running **lint-staged** → **Prettier** + **ESLint**
- **GitHub Actions** CI running the test suite on every push / PR to `main`

---

## Getting started

```bash
npm install
npm run dev        # webpack --watch (dev)
npm run buildProd  # production build
npm test           # mocha + c8 coverage
npm run lint       # eslint, zero warnings allowed
```

Then load it into Chrome:

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. **Load unpacked** → choose the `dist` directory
4. Pin it to the toolbar

The Supabase client reads `SUPABASE_URL` / `SUPABASE_KEY` from the build
environment (via `dotenv-webpack`), so you'll need those set to actually sign in.

### Project layout

```
src/
  background/        service worker: store, reducer, message switchboard, auth
  content_script/    scraper.ts (state machine), scraper_utils.ts (autofill),
                     filters, profile + index entry points
  common/            notifications, shared content helpers
  options/           options page: filters, prefs, advanced tags
  services/          supabase client + auth/db helpers
  utils.ts           waitForElement, sleep, network helpers
  constants.ts       the message-action vocabulary
  types.ts           Message + jobObjectType
static/              manifest.json, popup.html, options.html, icons
test/                mocha specs + sinon-chrome setup
```

---

## License

MIT — see [LICENSE](./LICENSE).

[![Build, test and deploy Pages](https://github.com/Vylantze/KCS/actions/workflows/gh-pages.yml/badge.svg?branch=main)](https://github.com/Vylantze/KCS/actions/workflows/gh-pages.yml)

# KCS

KCSimulator: https://vylantze.github.io/KCS/

## Development

Use Node 24.22.1 (see `.nvmrc`) and npm 11 or newer.

```sh
npm ci
npm run serve
```

The web application uses Vue 3, Vuex 4 and Vite. Public media stays at relative URLs so the same build works at `/KCS/` and in the desktop application.

## Validation

```sh
npm audit
npm run build
npx playwright install chromium
npm test
```

Browser tests serve the production build at `/KCS/` and check desktop and mobile startup, asset requests, settings persistence, music selection and ship changes. Test screenshots are written to `test-results/`.

All direct dependencies are pinned to the stable versions selected during the update. The `app-builder-lib` override selects `@electron/get` 5.1.0 to remove the older downloader's vulnerable logging dependency. Recheck this override when updating Electron Builder.

## Desktop

```sh
npm run electron:serve
npm run electron:build
```

`electron:serve` builds and opens the local site in Electron. Re-run it after source edits; use `npm run serve` for web hot reload. `electron:build` creates the Windows portable application under `dist_electron/`. The renderer has Node integration disabled, context isolation enabled and sandboxing enabled. `npm run clean` removes only the desktop build output.

The existing `bgmmake`, `kcmake`, `kcmakeall` and `semake` database commands remain available.

## GitHub Pages

In repository Settings → Pages, choose **GitHub Actions** as the publishing source. If the `github-pages` environment restricts deployment branches, allow `main`.

Pushes to `main` install from the lockfile, audit dependencies, build, run browser tests and deploy the `dist` artifact directly to Pages. Pull requests targeting `develop` or `main` run the same validation without deploying. The workflow can also be dispatched manually on `main`.

No generated commit, force push or secondary hosting branch is needed. The old `gh-pages` branch can remain as history; it is no longer used once the publishing source is changed. Merge development changes into `main` to publish them.

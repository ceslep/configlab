# AGENTS.md

## Dev Commands

```bash
npm run dev     # Start dev server
npm run build  # Build production (outputs to dist/)
npm run check  # TypeScript + Svelte type checking
npm run deploy # Build + deploy to GitHub Pages via gh-pages
```

## Project Structure

- **Entry**: `src/main.ts` -> `src/App.svelte`
- **Components**: `src/lib/components/*.svelte`
- **Build base**: `/configlab/` (configured in `vite.config.ts`)

## Architecture

- **Frontend**: Svelte 5 SPA calling PHP backend APIs
- **API layer**: `src/lib/service.ts` calls PHP endpoints (login, procedimientos, firmas)
- **Backend endpoints**: `login_configlab.php`, `getProcedimientos.php`, `guardarProcedimiento.php`, `eliminarProcedimiento.php`, `printphp/getFirmas.php`, `printphp/guardarFirmas.php`, `printphp/subirFirma.php`
- **Constants**: `src/lib/constants.ts` defines `BASE_URL` and types

## Notable Conventions

- **Svelte 5**: Uses runes (`$state`, `$derived`, `mount`). Do NOT use legacy `let` + reactivity.
- **Styling**: TailwindCSS 4 via `@tailwindcss/vite` plugin (no PostCSS config needed)
- **UI Components**: flowbite-svelte
- **TypeScript**: ~6.0.2 (older version - check compatibility before adding types)

## UI/UX Reference

- UI design skill available: load skill `ui-ux-pro-max` for palettes, component patterns, and styling guidance.
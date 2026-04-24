# AGENTS.md

## Dev Commands

```bash
npm run dev     # Start dev server
npm run build  # Build for production (outputs to /configlabmycar/)
npm run check  # TypeScript + Svelte type checking
```

## Project Structure

- **Entry**: `src/main.ts` -> `src/App.svelte`
- **Components**: `src/lib/components/*.svelte`
- **Build base**: `/configlabmycar/` (configured in `vite.config.ts`)

## Notable Conventions

- **Svelte 5**: Uses runes (`$state`, `$derived`). Do NOT use legacy `let` + reactivity.
- **Styling**: TailwindCSS 4 via `@tailwindcss/vite` plugin (no PostCSS config needed)
- **UI Components**: flowbite-svelte
- **TypeScript**: ~6.0.2 (older version, check compatibility)

## UI/UX Reference

- UI design skill available: load skill `ui-ux-pro-max` for palettes, component patterns, and styling guidance.
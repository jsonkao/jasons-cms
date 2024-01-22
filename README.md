## Setup

This repo uses npm.

## Developing

The entire app, exept the code editor, is in an iframe run on a WebContainer. The app run in that iframe is a SvelteKit app that lives in `/editor`. Run `npm run zip`, which packages up everything that's needed to run the editor app (Vite, esbuild, SvelteKit, Svelte compiler, etc.) which can subsequently be unpacked in the WebContainer.

Then, run `npm run dev`.

## Demo

The first live demo of U's CMS was released on YouTube on January 22, 2024. [Watch it here.](https://www.youtube.com/watch?v=F8ASZGM0-Io)

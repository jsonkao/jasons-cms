[us-cms.vercel.app](https://us-cms.vercel.app)

## Setup

This repo uses npm.

## Developing

```
npm run dev
```

Requires a .env file in `code-editor` with a `LIVEBLOCKS_SECRET_KEY` and a `LIVEBLOCKS_PUBLIC_KEY`.

## Structure

The main app is in `code-editor`, which provides code editing functionality for the Svelte components. Inside a WebContainer, the code editor runs a dev server for `text-editor`, which provides text editing functionality.

## Demos

The first live demo of U's CMS was released on YouTube on January 22, 2024 ([watch it here](https://www.youtube.com/watch?v=F8ASZGM0-Io)). A developer update was released on YouTube later that day ([watch it here](https://www.youtube.com/watch?v=YY1NmHOM-pU)). A second developer update was released on YouTube on January 24, 2024 ([watch it here](https://www.youtube.com/watch?v=8HMq1oGlcRo)). A third developer update was released on YouTube on January 25, 2024 ([watch it here](https://youtu.be/4xYKJ0YKWBE)). A fourth developer update was released on YouTube on January 29, 2024 ([watch it here](https://www.youtube.com/watch?v=dVcpn4YlUHc)).

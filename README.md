# EduCommerce

A responsive e‑learning marketplace built with Vite, React, and Tailwind CSS, deployed on Netlify.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Building for Production](#building-for-production)
5. [Testing on Mobile](#testing-on-mobile)
6. [Deployment on Netlify](#deployment-on-netlify)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

* **Node.js** v16 or higher (includes npm)
* **Git** (to clone the repository)

Verify installation:

```bash
node -v
npm -v
```

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your‑username/educommerce.git
   cd educommerce
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **(Optional) Copy and configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env to set any API keys or endpoints
   ```

---

## Available Scripts

In the project root, you can run:

| Command           | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR at `http://localhost:5173`      |
| `npm run build`   | Build production assets into `dist/`                           |
| `npm run preview` | Serve your production build locally at `http://localhost:4173` |

---

## Building for Production

Run:

```bash
npm run build
```

This generates an optimized `dist/` folder, ready to be served by any static hosting service.

---

## Testing on Mobile

1. **Meta viewport**
   Ensure your `index.html` includes:

   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

2. **Simulate in Chrome/Firefox**

   * Open DevTools ➔ Toggle device toolbar (Ctrl+Shift+M).
   * Test various device presets.

3. **On a real device**

   * Connect your phone and dev machine to the same network.
   * Run `npm run dev`.
   * Browse to `http://<your‑machine‑ip>:5173` (e.g. `http://192.168.0.10:5173`).

---

## Deployment on Netlify

1. **Connect your repository**

   * In Netlify dashboard, click **"New site from Git"**.
   * Select your Git provider and repository.

2. **Configure build settings**

   * **Build command**:

     ```
     npm run build
     ```
   * **Publish directory**:

     ```
     dist
     ```

3. **Environment variables**

   * If you use any `.env` keys, add them under **Site settings ➔ Build & deploy ➔ Environment**.

4. **Deploy**

   * Netlify will install dependencies, run the build, and publish your site.
   * On success, you’ll get a live URL like `https://your‑site.netlify.app`.

---

## Troubleshooting

* **Port already in use**
  Change Vite’s port in `vite.config.js`:

  ```js
  export default defineConfig({
    server: {
      port: 3000
    }
  })
  ```

* **Build errors**

  * Delete `node_modules/` and lock file, then reinstall:

    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
  * Ensure React dependencies and plugin versions are compatible.

* **Missing translations or broken UI**

  * Confirm your `i18n.js` keys match those used in components.
  * Clear localStorage key `educommerce_language` if language is stuck.

* **Netlify deploy fails**

  * Check Netlify build logs for missing env vars or syntax errors.
  * Ensure the publish directory is exactly `dist`.


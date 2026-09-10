# ShopNest — Full-Stack Deployment Capstone

A production-ready e-commerce product catalog demonstrating modular frontend architecture, client-side routing, a REST API, responsive design, search/filtering, cart state, and deployment configuration.

## Tech stack
- React 19 + Vite
- React Router
- Node.js + Express
- LocalStorage cart persistence
- Responsive CSS
- Render deployment configuration

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

For a production-style local run:

```bash
npm run build
npm start
```

Then open `http://localhost:3000`.

## Features
- Home landing page
- Product catalog
- Search and category filtering
- Product detail routes
- Persistent shopping cart
- Responsive mobile navigation
- Express API endpoints
- Health check at `/api/health`
- Optimized Vite production build
- Single-service Render deployment

## Deployment — Render
1. Push this folder to a GitHub repository.
2. Create a new Web Service in Render.
3. Connect the repository.
4. Use the included `render.yaml`, or set:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
5. Deploy and open the generated public URL.

## Suggested submission
Submit the public deployed URL plus this project ZIP. The project intentionally uses emoji/CSS product art instead of large image files so the initial payload stays lightweight.

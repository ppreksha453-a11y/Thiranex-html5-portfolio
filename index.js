import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const products = [
  { id: 1, name: "Aero Wireless Headphones", category: "Audio", price: 129, rating: 4.8, emoji: "🎧", accent: "blue", description: "Immersive over-ear sound with adaptive noise cancellation and 40-hour battery life.", featured: true },
  { id: 2, name: "Pulse Smart Watch", category: "Wearables", price: 179, rating: 4.7, emoji: "⌚", accent: "purple", description: "Fitness tracking, sleep insights and notifications in a lightweight aluminium case.", featured: true },
  { id: 3, name: "Nova Mechanical Keyboard", category: "Computing", price: 99, rating: 4.9, emoji: "⌨️", accent: "pink", description: "Compact mechanical keyboard with hot-swappable switches and RGB lighting.", featured: true },
  { id: 4, name: "Orbit Portable Speaker", category: "Audio", price: 69, rating: 4.6, emoji: "🔊", accent: "orange", description: "Room-filling sound in a waterproof portable design with 18-hour playback.", featured: false },
  { id: 5, name: "Luma Desk Lamp", category: "Home", price: 49, rating: 4.5, emoji: "💡", accent: "yellow", description: "Minimal LED desk lamp with adjustable brightness and warm-to-cool light.", featured: false },
  { id: 6, name: "Flow Travel Backpack", category: "Lifestyle", price: 89, rating: 4.8, emoji: "🎒", accent: "green", description: "Water-resistant everyday backpack with a padded laptop compartment.", featured: false },
  { id: 7, name: "Pixel 4K Monitor", category: "Computing", price: 329, rating: 4.7, emoji: "🖥️", accent: "cyan", description: "27-inch 4K display with crisp colour, USB-C connectivity and slim bezels.", featured: false },
  { id: 8, name: "Terra Smart Mug", category: "Home", price: 59, rating: 4.4, emoji: "☕", accent: "brown", description: "Temperature-controlled ceramic mug that keeps your drink warm for hours.", featured: false }
];

app.use(express.json());

app.get("/api/products", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const category = String(req.query.category || "All");
  let result = products.filter(p => category === "All" || p.category === category);
  if (q) result = result.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
  res.json(result);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.get("/api/categories", (_req, res) => {
  res.json(["All", ...new Set(products.map(p => p.category))]);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ShopNest API" });
});

const dist = path.join(__dirname, "../dist");
app.use(express.static(dist));
app.get("/{*splat}", (_req, res) => res.sendFile(path.join(dist, "index.html")));

app.listen(PORT, () => console.log(`ShopNest running on port ${PORT}`));
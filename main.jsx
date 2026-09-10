import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./styles.css";

const API = "/api";

function Header({ cartCount }) {
  const [open, setOpen] = useState(false);
  return <header className="header">
    <div className="container nav">
      <Link to="/" className="logo"><span>✦</span> ShopNest</Link>
      <nav className={open ? "navlinks open" : "navlinks"}>
        <Link to="/">Home</Link><Link to="/shop">Shop</Link><Link to="/about">About</Link>
      </nav>
      <div className="navactions">
        <Link className="cart" to="/cart">🛒 <b>{cartCount}</b></Link>
        <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">☰</button>
      </div>
    </div>
  </header>;
}

function ProductCard({ product, addToCart }) {
  return <article className="card">
    <Link to={`/product/${product.id}`} className={`product-art ${product.accent}`}><span>{product.emoji}</span></Link>
    <div className="cardbody">
      <div className="category">{product.category}</div>
      <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
      <div className="rating">★ {product.rating}</div>
      <div className="cardbottom"><strong>${product.price}</strong><button onClick={() => addToCart(product)}>Add to cart</button></div>
    </div>
  </article>;
}

function Shop({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "All";

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`).then(r => r.json()),
      fetch(`${API}/categories`).then(r => r.json())
    ]).then(([p, c]) => { setProducts(p); setCategories(c); });
  }, [q, category]);

  return <main className="container page">
    <div className="pagehead"><div><p className="eyebrow">DISCOVER</p><h1>Shop all products</h1><p className="muted">Curated tech and lifestyle essentials.</p></div>
      <input className="search" value={q} onChange={e => setParams({ q: e.target.value, category })} placeholder="Search products..." /></div>
    <div className="chips">{categories.map(c => <button className={category === c ? "chip active" : "chip"} key={c} onClick={() => setParams({ q, category: c })}>{c}</button>)}</div>
    <div className="grid">{products.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart}/>)}</div>
    {!products.length && <div className="empty"><h2>No products found</h2><p>Try another search or category.</p></div>}
  </main>;
}

function Home({ addToCart }) {
  const [featured, setFeatured] = useState([]);
  useEffect(() => { fetch(`${API}/products`).then(r => r.json()).then(p => setFeatured(p.filter(x => x.featured))); }, []);
  return <main>
    <section className="hero"><div className="container heroinner"><div>
      <p className="eyebrow">SMARTER SHOPPING</p><h1>Good products.<br/><span>Better everyday.</span></h1>
      <p className="lead">Explore a focused collection of modern tech and lifestyle essentials, built for people who value quality and simplicity.</p>
      <Link className="primary" to="/shop">Explore collection →</Link>
    </div><div className="heroorb">✦<small>CURATED<br/>ESSENTIALS</small></div></div></section>
    <section className="container section"><div className="sectionhead"><div><p className="eyebrow">TOP PICKS</p><h2>Featured products</h2></div><Link to="/shop">View all →</Link></div>
      <div className="grid">{featured.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart}/>)}</div>
    </section>
    <section className="band"><div className="container benefits"><div>⚡<b>Fast delivery</b><span>Reliable shipping</span></div><div>✓<b>Quality first</b><span>Carefully selected</span></div><div>↺<b>Easy returns</b><span>30-day policy</span></div></div></section>
  </main>;
}

function Product({ addToCart }) {
  const { id } = useParams(); const [p, setP] = useState(null);
  useEffect(() => { fetch(`${API}/products/${id}`).then(r => r.ok ? r.json() : null).then(setP); }, [id]);
  if (!p) return <main className="container page empty"><h2>Product not found</h2><Link to="/shop">Back to shop</Link></main>;
  return <main className="container detail"><div className={`detailart ${p.accent}`}>{p.emoji}</div><div className="detailinfo"><p className="eyebrow">{p.category}</p><h1>{p.name}</h1><div className="rating big">★ {p.rating} <span>customer rating</span></div><p className="detaildesc">{p.description}</p><div className="price">${p.price}</div><button className="primary" onClick={() => addToCart(p)}>Add to cart</button><p className="muted">Free shipping on orders over $100 · Secure checkout</p></div></main>;
}

function Cart({ cart, setCart }) {
  const total = cart.reduce((s, p) => s + p.price * p.qty, 0);
  const change = (id, d) => setCart(cart.map(x => x.id === id ? {...x, qty: Math.max(1, x.qty + d)} : x));
  return <main className="container page"><p className="eyebrow">YOUR BAG</p><h1>Shopping cart</h1>{!cart.length ? <div className="empty"><h2>Your cart is empty</h2><Link className="primary" to="/shop">Start shopping</Link></div> :
    <div className="cartlayout"><div>{cart.map(x => <div className="cartrow" key={x.id}><div className={`thumb ${x.accent}`}>{x.emoji}</div><div className="cartname"><b>{x.name}</b><span>${x.price}</span></div><div className="qty"><button onClick={() => change(x.id,-1)}>−</button>{x.qty}<button onClick={() => change(x.id,1)}>+</button></div><b>${(x.price*x.qty).toFixed(2)}</b><button className="remove" onClick={() => setCart(cart.filter(y => y.id !== x.id))}>×</button></div>)}</div>
      <aside className="summary"><h2>Order summary</h2><div><span>Subtotal</span><b>${total.toFixed(2)}</b></div><div><span>Shipping</span><b>{total >= 100 ? "Free" : "$9.00"}</b></div><hr/><div className="total"><span>Total</span><b>${(total + (total >= 100 ? 0 : 9)).toFixed(2)}</b></div><button className="primary full" onClick={() => alert("Demo checkout — order flow ready for integration.")}>Checkout</button></aside>
    </div>}</main>;
}

function About() { return <main className="container page about"><p className="eyebrow">ABOUT SHOPNEST</p><h1>Designed as a real-world<br/>web development capstone.</h1><p className="lead">ShopNest demonstrates modular React components, client-side routing, an Express API, responsive UI, search and filtering, cart state, and production deployment configuration.</p><div className="aboutgrid"><div><h3>Frontend</h3><p>React 19 + React Router with reusable product cards, pages and responsive layouts.</p></div><div><h3>Backend</h3><p>Express REST API serving products, categories and health checks.</p></div><div><h3>Performance</h3><p>Vite production build, lightweight assets, no external image dependencies and compressed-ready output.</p></div></div></main>; }

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("shopnest-cart") || "[]"));
  useEffect(() => localStorage.setItem("shopnest-cart", JSON.stringify(cart)), [cart]);
  const addToCart = p => setCart(c => c.some(x => x.id === p.id) ? c.map(x => x.id === p.id ? {...x, qty:x.qty+1} : x) : [...c, {...p, qty:1}]);
  const count = cart.reduce((s,x) => s+x.qty,0);
  return <><Header cartCount={count}/><Routes><Route path="/" element={<Home addToCart={addToCart}/>}/><Route path="/shop" element={<Shop addToCart={addToCart}/>}/><Route path="/product/:id" element={<Product addToCart={addToCart}/>}/><Route path="/cart" element={<Cart cart={cart} setCart={setCart}/>}/><Route path="/about" element={<About/>}/></Routes><footer><div className="container">© 2026 ShopNest · Full-Stack Deployment Capstone</div></footer></>;
}

createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);
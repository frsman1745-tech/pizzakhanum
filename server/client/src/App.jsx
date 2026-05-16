// src/App.jsx
// Customer-facing storefront for Pizza Khanum (بيتزا خانم).
// All pizza data is fetched dynamically from the backend API.
// NO localStorage, NO hardcoded data, NO Base64 images.

import { useState, useEffect, useCallback } from "react";
import { fetchPizzas } from "./services/api";
import toast, { Toaster } from "react-hot-toast";

// ─── CATEGORY LABELS ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "all", label: "All Pizzas", emoji: "🍕" },
  { value: "classic", label: "Classic", emoji: "🧀" },
  { value: "special", label: "Special", emoji: "⭐" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥦" },
  { value: "spicy", label: "Spicy", emoji: "🌶️" },
  { value: "seafood", label: "Seafood", emoji: "🦐" },
];

// ─── PIZZA CARD ───────────────────────────────────────────────────────────────
function PizzaCard({ pizza, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(pizza);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="pizza-card" aria-label={pizza.name}>
      <div className="pizza-card__img-wrap">
        {pizza.imageUrl ? (
          <img
            src={pizza.imageUrl}
            alt={pizza.name}
            className="pizza-card__img"
            loading="lazy"
          />
        ) : (
          <div className="pizza-card__img-placeholder">🍕</div>
        )}
        {!pizza.available && (
          <span className="pizza-card__badge pizza-card__badge--unavailable">Sold Out</span>
        )}
        <span className={`pizza-card__badge pizza-card__badge--cat`}>{pizza.category}</span>
      </div>

      <div className="pizza-card__body">
        <h3 className="pizza-card__name">{pizza.name}</h3>
        {pizza.description && (
          <p className="pizza-card__desc">{pizza.description}</p>
        )}
        {pizza.toppings?.length > 0 && (
          <p className="pizza-card__toppings">{pizza.toppings.join(" · ")}</p>
        )}
        <div className="pizza-card__footer">
          <span className="pizza-card__price">${Number(pizza.price).toFixed(2)}</span>
          <button
            className={`btn-add ${added ? "btn-add--done" : ""}`}
            onClick={handleAdd}
            disabled={!pizza.available}
            aria-label={`Add ${pizza.name} to cart`}
          >
            {added ? "✓ Added" : pizza.available ? "Add to Cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onClear }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <aside className="cart-drawer" role="complementary" aria-label="Shopping cart">
      <div className="cart-drawer__header">
        <h2>🛒 Your Order</h2>
        <button className="cart-drawer__close" onClick={onClose} aria-label="Close cart">
          ✕
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="cart-drawer__empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
              <li key={item._id} className="cart-list__item">
                <div className="cart-list__info">
                  <span className="cart-list__name">{item.name}</span>
                  <span className="cart-list__qty">× {item.qty}</span>
                </div>
                <div className="cart-list__right">
                  <span className="cart-list__price">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                  <button
                    className="cart-list__remove"
                    onClick={() => onRemove(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-drawer__total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>

          <button
            className="btn-checkout"
            onClick={() => {
              toast.success("Order placed! 🎉 We'll get started right away.");
              onClear();
              onClose();
            }}
          >
            Place Order
          </button>
          <button className="btn-clear" onClick={onClear}>
            Clear Cart
          </button>
        </>
      )}
    </aside>
  );
}

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="pizza-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton--img" />
          <div className="skeleton-card__body">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ── Fetch pizzas ────────────────────────────────────────────────────────────
  const loadPizzas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeCategory !== "all" ? { category: activeCategory } : {};
      const res = await fetchPizzas(params);
      setPizzas(res.data || []);
    } catch (err) {
      setError(err.message);
      toast.error("Could not load menu. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadPizzas();
  }, [loadPizzas]);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = (pizza) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === pizza._id);
      if (existing) {
        return prev.map((i) =>
          i._id === pizza._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...pizza, qty: 1 }];
    });
    toast.success(`${pizza.name} added to cart!`);
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i._id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── Filtered pizzas ─────────────────────────────────────────────────────────
  const displayed = pizzas.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__brand">
            <span className="site-header__logo">🍕</span>
            <div>
              <h1 className="site-header__title">Pizza Khanum</h1>
              <p className="site-header__subtitle">بيتزا خانم</p>
            </div>
          </div>

          <div className="site-header__actions">
            <input
              className="search-input"
              type="search"
              placeholder="Search pizzas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search pizzas"
            />
            <button
              className="cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${cartCount} items`}
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-btn__badge">{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── CATEGORY TABS ──────────────────────────────────────────────── */}
        <nav className="category-nav" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`category-btn ${activeCategory === cat.value ? "category-btn--active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
              aria-pressed={activeCategory === cat.value}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="site-main">
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button className="btn-retry" onClick={loadPizzas}>
              Retry
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <p>🍽️ No pizzas found{search ? ` for "${search}"` : ""}.</p>
          </div>
        ) : (
          <div className="pizza-grid">
            {displayed.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>

      {/* ── CART ───────────────────────────────────────────────────────── */}
      {cartOpen && (
        <>
          <div
            className="cart-overlay"
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />
          <CartDrawer
            cart={cart}
            onClose={() => setCartOpen(false)}
            onRemove={removeFromCart}
            onClear={() => setCart([])}
          />
        </>
      )}

      <style>{`
        /* ── RESET & BASE ─────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --red:       #c0392b;
          --red-dark:  #96281b;
          --red-light: #e74c3c;
          --cream:     #fdf6ec;
          --warm:      #f5e6d3;
          --brown:     #6b3a2a;
          --text:      #2c1a0e;
          --muted:     #7a6055;
          --white:     #ffffff;
          --shadow:    0 4px 24px rgba(44,26,14,.12);
          --radius:    14px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        body { background: var(--cream); color: var(--text); }

        /* ── HEADER ──────────────────────────────────────────────── */
        .site-header {
          background: linear-gradient(135deg, var(--red-dark) 0%, var(--red) 60%, #d44000 100%);
          color: var(--white);
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 16px rgba(0,0,0,.3);
        }
        .site-header__inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; padding: 1rem 1.5rem;
        }
        .site-header__brand { display: flex; align-items: center; gap: .75rem; }
        .site-header__logo { font-size: 2rem; }
        .site-header__title {
          font-size: 1.5rem; font-weight: 700; letter-spacing: .02em;
          font-family: Georgia, serif;
        }
        .site-header__subtitle { font-size: .8rem; opacity: .75; }
        .site-header__actions { display: flex; align-items: center; gap: .75rem; }

        .search-input {
          padding: .45rem .9rem; border-radius: 999px; border: none;
          background: rgba(255,255,255,.2); color: var(--white);
          font-size: .9rem; outline: none; width: 200px;
          transition: background .2s;
        }
        .search-input::placeholder { color: rgba(255,255,255,.7); }
        .search-input:focus { background: rgba(255,255,255,.35); }

        .cart-btn {
          position: relative; background: rgba(255,255,255,.2);
          border: none; color: var(--white); font-size: 1.4rem;
          width: 44px; height: 44px; border-radius: 50%;
          cursor: pointer; transition: background .2s;
        }
        .cart-btn:hover { background: rgba(255,255,255,.35); }
        .cart-btn__badge {
          position: absolute; top: -4px; right: -4px;
          background: #f39c12; color: var(--white);
          font-size: .65rem; font-weight: 700; border-radius: 999px;
          padding: 1px 5px; font-family: sans-serif;
        }

        /* ── CATEGORY NAV ─────────────────────────────────────────── */
        .category-nav {
          display: flex; gap: .5rem; padding: .6rem 1.5rem;
          overflow-x: auto; scrollbar-width: none;
          border-top: 1px solid rgba(255,255,255,.15);
        }
        .category-nav::-webkit-scrollbar { display: none; }
        .category-btn {
          flex-shrink: 0; display: flex; align-items: center; gap: .4rem;
          padding: .35rem .9rem; border-radius: 999px; border: 1.5px solid rgba(255,255,255,.4);
          background: transparent; color: var(--white); font-size: .82rem;
          cursor: pointer; transition: background .15s, border-color .15s;
          white-space: nowrap;
        }
        .category-btn:hover { background: rgba(255,255,255,.15); }
        .category-btn--active {
          background: var(--white); color: var(--red-dark);
          border-color: var(--white); font-weight: 600;
        }

        /* ── MAIN ────────────────────────────────────────────────── */
        .site-main { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }

        /* ── PIZZA GRID ──────────────────────────────────────────── */
        .pizza-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        /* ── PIZZA CARD ──────────────────────────────────────────── */
        .pizza-card {
          background: var(--white); border-radius: var(--radius);
          overflow: hidden; box-shadow: var(--shadow);
          transition: transform .2s, box-shadow .2s;
        }
        .pizza-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(44,26,14,.18);
        }
        .pizza-card__img-wrap {
          position: relative; height: 200px; overflow: hidden;
          background: var(--warm);
        }
        .pizza-card__img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .3s;
        }
        .pizza-card:hover .pizza-card__img { transform: scale(1.05); }
        .pizza-card__img-placeholder {
          display: flex; align-items: center; justify-content: center;
          height: 100%; font-size: 4rem;
        }
        .pizza-card__badge {
          position: absolute; top: 10px; padding: .25rem .6rem;
          border-radius: 999px; font-size: .7rem; font-weight: 600;
          font-family: sans-serif; text-transform: capitalize;
        }
        .pizza-card__badge--unavailable {
          right: 10px; background: #2c1a0e; color: var(--white);
        }
        .pizza-card__badge--cat {
          left: 10px; background: var(--red); color: var(--white);
        }
        .pizza-card__body { padding: 1rem 1.1rem 1.1rem; }
        .pizza-card__name { font-size: 1.1rem; font-weight: 700; color: var(--brown); }
        .pizza-card__desc {
          font-size: .82rem; color: var(--muted); margin-top: .35rem;
          line-height: 1.5; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .pizza-card__toppings {
          font-size: .75rem; color: var(--muted); margin-top: .3rem;
          font-style: italic;
        }
        .pizza-card__footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: .9rem;
        }
        .pizza-card__price { font-size: 1.15rem; font-weight: 700; color: var(--red); }

        .btn-add {
          padding: .45rem 1rem; border-radius: 999px;
          background: var(--red); color: var(--white);
          border: none; font-size: .82rem; font-weight: 600;
          cursor: pointer; transition: background .15s, transform .1s;
        }
        .btn-add:hover:not(:disabled) { background: var(--red-dark); transform: scale(1.04); }
        .btn-add:disabled { background: #ccc; cursor: not-allowed; }
        .btn-add--done { background: #27ae60; }

        /* ── SKELETON ────────────────────────────────────────────── */
        @keyframes shimmer {
          from { background-position: -400px 0; }
          to   { background-position:  400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #ede4d8 25%, #f5ede1 50%, #ede4d8 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 6px;
        }
        .skeleton-card {
          background: var(--white); border-radius: var(--radius); overflow: hidden;
          box-shadow: var(--shadow);
        }
        .skeleton--img { height: 200px; border-radius: 0; }
        .skeleton-card__body { padding: 1rem; }
        .skeleton--title { height: 18px; width: 70%; margin-bottom: .75rem; }
        .skeleton--line  { height: 13px; width: 90%; margin-bottom: .5rem; }
        .skeleton--short { width: 50%; }

        /* ── STATES ──────────────────────────────────────────────── */
        .error-state, .empty-state {
          text-align: center; padding: 4rem 1rem; color: var(--muted); font-size: 1.1rem;
        }
        .btn-retry {
          margin-top: 1rem; padding: .5rem 1.5rem;
          background: var(--red); color: var(--white); border: none;
          border-radius: 999px; cursor: pointer; font-size: .9rem;
        }

        /* ── CART OVERLAY ────────────────────────────────────────── */
        .cart-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.4);
          z-index: 200; backdrop-filter: blur(2px);
        }
        .cart-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: 360px;
          background: var(--white); z-index: 201;
          display: flex; flex-direction: column;
          box-shadow: -4px 0 24px rgba(0,0,0,.2);
          animation: slideIn .25s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .cart-drawer__header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.25rem 1.25rem .75rem;
          border-bottom: 1px solid var(--warm);
        }
        .cart-drawer__header h2 { font-size: 1.2rem; color: var(--brown); }
        .cart-drawer__close {
          background: none; border: none; font-size: 1.2rem;
          cursor: pointer; color: var(--muted); padding: .25rem;
        }
        .cart-drawer__empty {
          padding: 2rem; text-align: center; color: var(--muted);
        }
        .cart-list { list-style: none; flex: 1; overflow-y: auto; padding: .5rem 0; }
        .cart-list__item {
          display: flex; justify-content: space-between; align-items: center;
          padding: .75rem 1.25rem;
          border-bottom: 1px solid var(--warm);
        }
        .cart-list__info { display: flex; flex-direction: column; gap: .2rem; }
        .cart-list__name { font-size: .9rem; font-weight: 600; color: var(--brown); }
        .cart-list__qty { font-size: .78rem; color: var(--muted); }
        .cart-list__right { display: flex; align-items: center; gap: .75rem; }
        .cart-list__price { font-weight: 700; color: var(--red); }
        .cart-list__remove {
          background: none; border: none; color: var(--muted);
          cursor: pointer; font-size: .9rem;
        }
        .cart-drawer__total {
          display: flex; justify-content: space-between;
          padding: 1rem 1.25rem; font-size: 1.1rem;
          border-top: 2px solid var(--warm);
        }
        .cart-drawer__total strong { color: var(--red); font-size: 1.2rem; }

        .btn-checkout {
          margin: .5rem 1.25rem .25rem; padding: .75rem;
          background: var(--red); color: var(--white); border: none;
          border-radius: var(--radius); font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: background .15s;
        }
        .btn-checkout:hover { background: var(--red-dark); }
        .btn-clear {
          margin: 0 1.25rem 1.25rem; padding: .5rem;
          background: none; border: 1px solid #ddd; color: var(--muted);
          border-radius: var(--radius); font-size: .85rem; cursor: pointer;
        }

        /* ── RESPONSIVE ──────────────────────────────────────────── */
        @media (max-width: 480px) {
          .search-input { width: 130px; }
          .cart-drawer { width: 100%; }
          .site-header__title { font-size: 1.2rem; }
        }
      `}</style>
    </>
  );
}

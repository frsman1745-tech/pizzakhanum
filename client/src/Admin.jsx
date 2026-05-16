// src/Admin.jsx
// Admin dashboard for Pizza Khanum (بيتزا خانم).
// Full CRUD linked to MongoDB backend.
// Cloudinary image upload – NO localStorage, NO Base64.

import { useState, useEffect, useCallback, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { fetchPizzas, createPizza, updatePizza, deletePizza } from "./services/api";
import { useCloudinaryUpload } from "./hooks/useCloudinaryUpload";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ["classic", "special", "vegetarian", "spicy", "seafood"];
const SIZES = ["small", "medium", "large"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "classic",
  available: true,
  toppings: "",
  size: "medium",
};

// ─── PIZZA FORM MODAL ─────────────────────────────────────────────────────────
function PizzaFormModal({ pizza, onClose, onSave }) {
  const [form, setForm] = useState(
    pizza
      ? { ...pizza, toppings: (pizza.toppings || []).join(", ") }
      : EMPTY_FORM
  );
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(pizza?.imageUrl || "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const { uploading, uploadImage } = useCloudinaryUpload();

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Pizza name is required."); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.error("Please enter a valid price."); return;
    }

    setSaving(true);
    try {
      let imageUrl = form.imageUrl;

      // Upload new image to Cloudinary if one was selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) throw new Error("Image upload returned empty URL.");
      }

      const payload = {
        ...form,
        price: parseFloat(form.price),
        imageUrl,
        toppings: form.toppings
          ? form.toppings.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (pizza) {
        const res = await updatePizza(pizza._id, payload);
        onSave(res.data, "update");
      } else {
        const res = await createPizza(payload);
        onSave(res.data, "create");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save pizza.");
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || uploading;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Pizza form">
      <div className="modal">
        <div className="modal__header">
          <h2>{pizza ? "Edit Pizza" : "Add New Pizza"}</h2>
          <button className="modal__close" onClick={onClose} disabled={isBusy}>✕</button>
        </div>

        <div className="modal__body">
          {/* Image */}
          <div className="field">
            <label className="field__label">Image</label>
            <div
              className="img-drop"
              onClick={() => fileRef.current.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current.click()}
              tabIndex={0}
              role="button"
              aria-label="Upload pizza image"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="img-drop__preview" />
              ) : (
                <span className="img-drop__placeholder">
                  <span>📷</span>
                  <span>Click to upload</span>
                  <small>JPG, PNG, WEBP · Max 5 MB</small>
                </span>
              )}
              {uploading && <div className="img-drop__overlay">Uploading…</div>}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            {preview && (
              <button
                className="btn-sm btn-sm--ghost"
                onClick={() => { setPreview(""); setImageFile(null); setForm((f) => ({ ...f, imageUrl: "" })); }}
              >
                Remove image
              </button>
            )}
          </div>

          <div className="field-row">
            {/* Name */}
            <div className="field field--flex">
              <label className="field__label">Name *</label>
              <input className="input" value={form.name} onChange={set("name")} placeholder="Margherita" />
            </div>
            {/* Price */}
            <div className="field field--narrow">
              <label className="field__label">Price ($) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="12.99" />
            </div>
          </div>

          {/* Description */}
          <div className="field">
            <label className="field__label">Description</label>
            <textarea className="input input--ta" rows={3} value={form.description} onChange={set("description")} placeholder="Classic tomato sauce with fresh mozzarella…" />
          </div>

          <div className="field-row">
            {/* Category */}
            <div className="field field--flex">
              <label className="field__label">Category</label>
              <select className="input" value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            {/* Size */}
            <div className="field field--flex">
              <label className="field__label">Size</label>
              <select className="input" value={form.size} onChange={set("size")}>
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toppings */}
          <div className="field">
            <label className="field__label">Toppings <small>(comma-separated)</small></label>
            <input className="input" value={form.toppings} onChange={set("toppings")} placeholder="Cheese, Basil, Tomato" />
          </div>

          {/* Available */}
          <label className="toggle">
            <input type="checkbox" checked={form.available} onChange={set("available")} />
            <span className="toggle__track" />
            <span className="toggle__label">Available for order</span>
          </label>
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose} disabled={isBusy}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={isBusy}>
            {isBusy
              ? uploading ? "Uploading image…" : "Saving…"
              : pizza ? "Save Changes" : "Create Pizza"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ──────────────────────────────────────────────────────────
function DeleteConfirm({ pizza, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal modal--sm">
        <div className="modal__header">
          <h2>Delete Pizza</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          <p>Are you sure you want to delete <strong>{pizza.name}</strong>? This cannot be undone.</p>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PIZZA ROW ────────────────────────────────────────────────────────────────
function PizzaRow({ pizza, onEdit, onDelete }) {
  return (
    <tr className="table__row">
      <td className="table__cell">
        <div className="pizza-row__img-wrap">
          {pizza.imageUrl
            ? <img src={pizza.imageUrl} alt={pizza.name} className="pizza-row__img" loading="lazy" />
            : <span className="pizza-row__no-img">🍕</span>
          }
        </div>
      </td>
      <td className="table__cell">
        <div className="pizza-row__name">{pizza.name}</div>
        {pizza.description && (
          <div className="pizza-row__desc">{pizza.description.slice(0, 60)}{pizza.description.length > 60 ? "…" : ""}</div>
        )}
      </td>
      <td className="table__cell">
        <span className="tag tag--cat">{pizza.category}</span>
      </td>
      <td className="table__cell pizza-row__price">${Number(pizza.price).toFixed(2)}</td>
      <td className="table__cell">
        <span className={`tag ${pizza.available ? "tag--green" : "tag--red"}`}>
          {pizza.available ? "Available" : "Sold Out"}
        </span>
      </td>
      <td className="table__cell table__cell--actions">
        <button className="btn-icon btn-icon--edit" onClick={() => onEdit(pizza)} aria-label={`Edit ${pizza.name}`}>
          ✏️
        </button>
        <button className="btn-icon btn-icon--delete" onClick={() => onDelete(pizza)} aria-label={`Delete ${pizza.name}`}>
          🗑️
        </button>
      </td>
    </tr>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const [formTarget, setFormTarget] = useState(null);   // null = closed, {} = new, {pizza} = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPizzas();
      setPizzas(res.data || []);
    } catch (err) {
      setError(err.message);
      toast.error("Could not load pizzas: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── CRUD callbacks ─────────────────────────────────────────────────────────
  const handleSave = (pizza, mode) => {
    if (mode === "create") {
      setPizzas((prev) => [pizza, ...prev]);
      toast.success(`🍕 "${pizza.name}" created!`);
    } else {
      setPizzas((prev) => prev.map((p) => (p._id === pizza._id ? pizza : p)));
      toast.success(`✅ "${pizza.name}" updated.`);
    }
    setFormTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePizza(deleteTarget._id);
      setPizzas((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success(`🗑️ "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const displayed = pizzas.filter((p) => {
    const matchCat = filterCat === "all" || p.category === filterCat;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: pizzas.length,
    available: pizzas.filter((p) => p.available).length,
    unavailable: pizzas.filter((p) => !p.available).length,
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      <div className="admin">
        {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar__logo">
            <span>🍕</span>
            <div>
              <div className="sidebar__brand">Pizza Khanum</div>
              <div className="sidebar__sub">Admin Panel</div>
            </div>
          </div>
          <nav className="sidebar__nav">
            <span className="sidebar__nav-item sidebar__nav-item--active">🍕 Menu</span>
            <a href="/" className="sidebar__nav-item">🏪 Storefront ↗</a>
          </nav>
          <div className="sidebar__stats">
            <div className="stat-box"><span className="stat-box__n">{stats.total}</span><span className="stat-box__l">Total</span></div>
            <div className="stat-box"><span className="stat-box__n stat-box__n--green">{stats.available}</span><span className="stat-box__l">Available</span></div>
            <div className="stat-box"><span className="stat-box__n stat-box__n--red">{stats.unavailable}</span><span className="stat-box__l">Sold Out</span></div>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────────── */}
        <div className="admin__main">
          <header className="admin__header">
            <div>
              <h1 className="admin__title">Menu Management</h1>
              <p className="admin__sub">Add, edit, and remove pizzas from the live menu.</p>
            </div>
            <button className="btn btn--primary" onClick={() => setFormTarget({})}>
              + Add Pizza
            </button>
          </header>

          {/* Toolbar */}
          <div className="toolbar">
            <input
              className="input toolbar__search"
              type="search"
              placeholder="Search by name or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input toolbar__filter" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button className="btn-icon btn-icon--refresh" onClick={load} title="Refresh" aria-label="Refresh pizza list">🔄</button>
          </div>

          {/* Table */}
          <div className="table-wrap">
            {loading ? (
              <div className="admin__loading">
                <div className="spinner" aria-label="Loading" />
                <p>Loading menu…</p>
              </div>
            ) : error ? (
              <div className="admin__error">
                <p>⚠️ {error}</p>
                <button className="btn btn--ghost" onClick={load}>Retry</button>
              </div>
            ) : displayed.length === 0 ? (
              <div className="admin__empty">
                <p>🍽️ No pizzas found. {pizzas.length > 0 ? "Try clearing your search." : "Add your first pizza!"}</p>
              </div>
            ) : (
              <table className="table" aria-label="Pizza list">
                <thead>
                  <tr>
                    <th className="table__th">Image</th>
                    <th className="table__th">Name</th>
                    <th className="table__th">Category</th>
                    <th className="table__th">Price</th>
                    <th className="table__th">Status</th>
                    <th className="table__th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((pizza) => (
                    <PizzaRow
                      key={pizza._id}
                      pizza={pizza}
                      onEdit={(p) => setFormTarget(p)}
                      onDelete={(p) => setDeleteTarget(p)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {formTarget !== null && (
        <PizzaFormModal
          pizza={formTarget?._id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          pizza={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
        />
      )}

      <style>{`
        /* ── BASE ──────────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --red:      #c0392b;
          --red-dark: #96281b;
          --cream:    #fdf6ec;
          --warm:     #f0e4d0;
          --brown:    #6b3a2a;
          --text:     #2c1a0e;
          --muted:    #7a6055;
          --white:    #ffffff;
          --bg:       #f7f0e8;
          --border:   #e6d5c4;
          --green:    #27ae60;
          --danger:   #e74c3c;
          --shadow:   0 2px 16px rgba(44,26,14,.1);
          --radius:   12px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        body { background: var(--bg); color: var(--text); }

        /* ── LAYOUT ────────────────────────────────────────────────── */
        .admin {
          display: flex; min-height: 100vh;
        }

        /* ── SIDEBAR ───────────────────────────────────────────────── */
        .sidebar {
          width: 240px; flex-shrink: 0;
          background: linear-gradient(160deg, #2c1a0e 0%, #4a2518 100%);
          color: var(--white); display: flex; flex-direction: column;
          padding: 1.5rem 1rem; gap: 1.5rem; position: sticky; top: 0;
          height: 100vh; overflow-y: auto;
        }
        .sidebar__logo { display: flex; align-items: center; gap: .75rem; }
        .sidebar__logo span { font-size: 1.8rem; }
        .sidebar__brand { font-size: 1.05rem; font-weight: 700; }
        .sidebar__sub { font-size: .72rem; opacity: .6; }
        .sidebar__nav { display: flex; flex-direction: column; gap: .4rem; }
        .sidebar__nav-item {
          display: block; padding: .6rem .8rem; border-radius: 8px;
          font-size: .88rem; cursor: pointer; color: rgba(255,255,255,.75);
          text-decoration: none; transition: background .15s, color .15s;
        }
        .sidebar__nav-item:hover { background: rgba(255,255,255,.1); color: var(--white); }
        .sidebar__nav-item--active { background: rgba(255,255,255,.15); color: var(--white); font-weight: 600; }
        .sidebar__stats { display: flex; flex-direction: column; gap: .5rem; margin-top: auto; }
        .stat-box {
          background: rgba(255,255,255,.08); border-radius: 8px;
          padding: .6rem .8rem; display: flex; justify-content: space-between;
        }
        .stat-box__n { font-size: 1.2rem; font-weight: 700; }
        .stat-box__n--green { color: #2ecc71; }
        .stat-box__n--red { color: #e74c3c; }
        .stat-box__l { font-size: .78rem; opacity: .6; align-self: center; }

        /* ── ADMIN MAIN ─────────────────────────────────────────────── */
        .admin__main { flex: 1; padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem; overflow: hidden; }
        .admin__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .admin__title { font-size: 1.6rem; color: var(--brown); }
        .admin__sub { font-size: .85rem; color: var(--muted); margin-top: .2rem; }

        /* ── TOOLBAR ───────────────────────────────────────────────── */
        .toolbar { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }
        .toolbar__search { flex: 1; min-width: 200px; }
        .toolbar__filter { width: 170px; }

        /* ── TABLE ─────────────────────────────────────────────────── */
        .table-wrap { overflow-x: auto; border-radius: var(--radius); box-shadow: var(--shadow); background: var(--white); }
        .table { width: 100%; border-collapse: collapse; }
        .table__th {
          text-align: left; padding: .85rem 1rem;
          font-size: .78rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: .06em; color: var(--muted);
          background: var(--warm); border-bottom: 1px solid var(--border);
        }
        .table__row { transition: background .15s; }
        .table__row:hover { background: var(--cream); }
        .table__row:not(:last-child) { border-bottom: 1px solid var(--border); }
        .table__cell { padding: .8rem 1rem; vertical-align: middle; }
        .table__cell--actions { display: flex; gap: .5rem; align-items: center; }

        /* ── PIZZA ROW ─────────────────────────────────────────────── */
        .pizza-row__img-wrap { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; background: var(--warm); display: flex; align-items: center; justify-content: center; }
        .pizza-row__img { width: 100%; height: 100%; object-fit: cover; }
        .pizza-row__no-img { font-size: 1.6rem; }
        .pizza-row__name { font-weight: 600; font-size: .9rem; color: var(--brown); }
        .pizza-row__desc { font-size: .78rem; color: var(--muted); margin-top: .15rem; }
        .pizza-row__price { font-weight: 700; color: var(--red); }

        .tag {
          display: inline-block; padding: .2rem .6rem; border-radius: 999px;
          font-size: .72rem; font-weight: 600; text-transform: capitalize;
          font-family: sans-serif;
        }
        .tag--cat { background: #fde8d8; color: var(--brown); }
        .tag--green { background: #d4efdf; color: #1e8449; }
        .tag--red { background: #fde8e8; color: #922b21; }

        /* ── BUTTONS ───────────────────────────────────────────────── */
        .btn {
          padding: .55rem 1.2rem; border-radius: 8px; border: none;
          font-size: .88rem; font-weight: 600; cursor: pointer;
          transition: background .15s, opacity .15s;
        }
        .btn:disabled { opacity: .55; cursor: not-allowed; }
        .btn--primary { background: var(--red); color: var(--white); }
        .btn--primary:hover:not(:disabled) { background: var(--red-dark); }
        .btn--ghost { background: none; border: 1px solid var(--border); color: var(--text); }
        .btn--ghost:hover:not(:disabled) { background: var(--warm); }
        .btn--danger { background: var(--danger); color: var(--white); }
        .btn--danger:hover:not(:disabled) { background: #c0392b; }

        .btn-icon {
          background: none; border: none; font-size: 1.1rem; cursor: pointer;
          padding: .35rem; border-radius: 6px; transition: background .15s;
        }
        .btn-icon--edit:hover { background: #fde8d8; }
        .btn-icon--delete:hover { background: #fde8e8; }
        .btn-icon--refresh:hover { background: var(--warm); }

        .btn-sm { font-size: .78rem; padding: .25rem .6rem; border: none; cursor: pointer; border-radius: 6px; margin-top: .3rem; }
        .btn-sm--ghost { background: none; color: var(--muted); text-decoration: underline; }

        /* ── INPUTS ────────────────────────────────────────────────── */
        .input {
          width: 100%; padding: .55rem .8rem;
          border: 1.5px solid var(--border); border-radius: 8px;
          background: var(--white); color: var(--text); font-size: .88rem;
          outline: none; font-family: inherit; transition: border-color .15s;
        }
        .input:focus { border-color: var(--red); }
        .input--ta { resize: vertical; min-height: 70px; }

        /* ── FORM FIELDS ───────────────────────────────────────────── */
        .field { display: flex; flex-direction: column; gap: .3rem; }
        .field--flex { flex: 1; }
        .field--narrow { width: 130px; }
        .field__label { font-size: .8rem; font-weight: 700; color: var(--brown); }
        .field__label small { font-weight: 400; color: var(--muted); }
        .field-row { display: flex; gap: .75rem; align-items: flex-start; flex-wrap: wrap; }

        /* ── IMAGE DROP ────────────────────────────────────────────── */
        .img-drop {
          position: relative; width: 100%; height: 160px;
          border: 2px dashed var(--border); border-radius: var(--radius);
          cursor: pointer; overflow: hidden; background: var(--warm);
          display: flex; align-items: center; justify-content: center;
          transition: border-color .15s;
        }
        .img-drop:hover, .img-drop:focus { border-color: var(--red); outline: none; }
        .img-drop__preview { width: 100%; height: 100%; object-fit: cover; }
        .img-drop__placeholder {
          display: flex; flex-direction: column; align-items: center; gap: .4rem;
          color: var(--muted); font-size: .85rem;
        }
        .img-drop__placeholder span:first-child { font-size: 2rem; }
        .img-drop__overlay {
          position: absolute; inset: 0;
          background: rgba(44,26,14,.55); color: var(--white);
          display: flex; align-items: center; justify-content: center;
          font-size: .9rem; font-weight: 600;
        }

        /* ── TOGGLE ────────────────────────────────────────────────── */
        .toggle {
          display: flex; align-items: center; gap: .65rem; cursor: pointer;
          user-select: none;
        }
        .toggle input { display: none; }
        .toggle__track {
          width: 40px; height: 22px; border-radius: 999px;
          background: var(--border); transition: background .2s; flex-shrink: 0;
          position: relative;
        }
        .toggle__track::after {
          content: ""; position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--white); transition: left .2s;
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
        }
        .toggle input:checked + .toggle__track { background: var(--green); }
        .toggle input:checked + .toggle__track::after { left: 21px; }
        .toggle__label { font-size: .88rem; }

        /* ── MODAL ─────────────────────────────────────────────────── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.45);
          z-index: 300; display: flex; align-items: center; justify-content: center;
          padding: 1rem; backdrop-filter: blur(3px);
        }
        .modal {
          background: var(--white); border-radius: var(--radius);
          width: 100%; max-width: 540px; max-height: 90vh;
          display: flex; flex-direction: column;
          box-shadow: 0 16px 48px rgba(0,0,0,.25);
          animation: popIn .2s ease;
        }
        .modal--sm { max-width: 380px; }
        @keyframes popIn {
          from { transform: scale(.95); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .modal__header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.25rem 1.5rem .75rem;
          border-bottom: 1px solid var(--border);
        }
        .modal__header h2 { font-size: 1.15rem; color: var(--brown); }
        .modal__close {
          background: none; border: none; font-size: 1.1rem;
          cursor: pointer; color: var(--muted); padding: .25rem;
        }
        .modal__body {
          flex: 1; overflow-y: auto;
          padding: 1.25rem 1.5rem;
          display: flex; flex-direction: column; gap: .9rem;
        }
        .modal__footer {
          display: flex; justify-content: flex-end; gap: .75rem;
          padding: .75rem 1.5rem 1.25rem;
          border-top: 1px solid var(--border);
        }

        /* ── STATE ─────────────────────────────────────────────────── */
        .admin__loading, .admin__error, .admin__empty {
          padding: 4rem 1rem; text-align: center; color: var(--muted);
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .spinner {
          width: 36px; height: 36px; border: 3px solid var(--border);
          border-top-color: var(--red); border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── RESPONSIVE ─────────────────────────────────────────────── */
        @media (max-width: 700px) {
          .sidebar { display: none; }
          .admin__main { padding: 1rem; }
        }
      `}</style>
    </>
  );
}

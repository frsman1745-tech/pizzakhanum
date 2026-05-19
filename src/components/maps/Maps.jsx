// src/components/maps/BranchMap.jsx
// Read-only Leaflet map showing the restaurant branch location.
// Extracted from App.jsx.

import { useEffect, useRef, useState } from "react";
import { BRANCH } from "../../constants/defaults.js";

export function BranchMap() {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function tryInit() {
      if (mapRef.current) return;
      if (!window.L) { setTimeout(tryInit, 200); return; }
      if (!divRef.current) return;
      try {
        const map = window.L.map(divRef.current, {
          zoomControl: true, attributionControl: false,
          dragging: true, scrollWheelZoom: false,
        }).setView([BRANCH.lat, BRANCH.lng], 15);

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        const icon = window.L.divIcon({
          html: `<div style="background:linear-gradient(135deg,#C8A96A,#8B6B4A);width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #0f0f0f;box-shadow:0 4px 14px rgba(200,169,106,.5)"><span style="transform:rotate(45deg);font-size:16px">🍕</span></div>`,
          className: "", iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38],
        });

        window.L.marker([BRANCH.lat, BRANCH.lng], { icon })
          .addTo(map)
          .bindPopup(`<div style="font-family:'Noto Kufi Arabic',sans-serif;direction:rtl;font-size:.82rem;text-align:right;padding:4px 2px"><strong style="color:#C8A96A">${BRANCH.name}</strong></div>`)
          .openPopup();

        mapRef.current = map;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 300);
      } catch (e) { console.error("BranchMap init", e); }
    }
    tryInit();
    return () => { if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; } };
  }, []);

  return (
    <div>
      <div ref={divRef} style={{ width: "100%", height: 220, borderRadius: 14, border: "1px solid var(--gold-alpha-10)", overflow: "hidden", background: "#111", marginBottom: 10 }}>
        {!ready && (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: ".78rem", gap: 8 }}>
            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            جاري تحميل الخريطة...
          </div>
        )}
      </div>
      <a href={BRANCH.googleMaps} target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px", borderRadius: 11, background: "linear-gradient(135deg,#1a3a1a,#0d1a0d)", border: "1px solid var(--green-alpha)", color: "var(--green)", fontSize: ".84rem", fontWeight: 700, fontFamily: "var(--font)", textDecoration: "none" }}>
        <span>🗺</span> ذهاب للموقع على خرائط جوجل
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// src/components/maps/DeliveryMap.jsx
// Interactive delivery location picker.

export function DeliveryMap({ onSelect }) {
  const divRef   = useRef(null);
  const mapRef   = useRef(null);
  const markerRef = useRef(null);
  const tileRef  = useRef(null);
  const [mapType, setMapType] = useState("street");
  const [search,  setSearch]  = useState("");
  const [busy,    setBusy]    = useState(false);
  const [ready,   setReady]   = useState(false);

  const TILES = {
    street:    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  useEffect(() => {
    function tryInit() {
      if (mapRef.current) return;
      if (!window.L) { setTimeout(tryInit, 200); return; }
      if (!divRef.current) return;
      try {
        const map = window.L.map(divRef.current, { zoomControl: true, attributionControl: false }).setView([BRANCH.lat, BRANCH.lng], 13);
        tileRef.current = window.L.tileLayer(TILES.street).addTo(map);
        map.on("click", (e) => place(map, e.latlng.lat, e.latlng.lng));
        mapRef.current = map;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 300);
      } catch (e) { console.error("DeliveryMap", e); }
    }
    tryInit();
    return () => { if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; } };
  }, []);

  function place(map, lat, lng) {
    if (markerRef.current) { try { markerRef.current.remove(); } catch {} }
    markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(map).bindPopup("موقعك ✓").openPopup();
    markerRef.current.on("dragend", (ev) => {
      const p = ev.target.getLatLng();
      onSelect({ lat: p.lat.toFixed(5), lng: p.lng.toFixed(5) });
    });
    onSelect({ lat: lat.toFixed(5), lng: lng.toFixed(5) });
  }

  function switchLayer(t) {
    if (!mapRef.current || t === mapType) return;
    if (tileRef.current) { try { tileRef.current.remove(); } catch {} }
    tileRef.current = window.L.tileLayer(TILES[t]).addTo(mapRef.current);
    setMapType(t);
  }

  async function doSearch(e) {
    e.preventDefault();
    if (!search.trim() || !mapRef.current) return;
    setBusy(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + " حماة سوريا")}&limit=1`);
      const d = await r.json();
      if (d[0]) { const { lat, lon } = d[0]; mapRef.current.flyTo([+lat, +lon], 16, { duration: 1.2 }); place(mapRef.current, +lat, +lon); }
    } finally { setBusy(false); }
  }

  return (
    <div>
      <form onSubmit={doSearch} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منطقتك في حماة..."
          style={{ flex: 1, padding: "8px 12px", fontSize: ".8rem", background: "#161616", border: "1px solid #252525", borderRadius: 10, color: "var(--text-primary)", fontFamily: "var(--font)", outline: "none" }} />
        <button type="submit" disabled={busy}
          style={{ padding: "8px 13px", background: "var(--gold)", border: "none", borderRadius: 9, color: "#0f0f0f", cursor: "pointer", fontWeight: 700, fontFamily: "var(--font)", fontSize: ".78rem", flexShrink: 0, opacity: busy ? .6 : 1 }}>
          {busy ? "..." : "بحث"}
        </button>
      </form>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[["street", "🗺 عادية"], ["satellite", "🛰 قمر"]].map(([k, l]) => (
          <button key={k} onClick={() => switchLayer(k)}
            style={{ flex: 1, padding: "6px", background: mapType === k ? "var(--gold-alpha-10)" : "#141414", border: `1px solid ${mapType === k ? "var(--gold)" : "#252525"}`, borderRadius: 7, color: mapType === k ? "var(--gold)" : "#444", cursor: "pointer", fontFamily: "var(--font)", fontSize: ".72rem", fontWeight: 600 }}>
            {l}
          </button>
        ))}
      </div>
      <div ref={divRef} style={{ width: "100%", height: 230, borderRadius: 13, border: "1px solid var(--gold-alpha-10)", overflow: "hidden", background: "#111", marginBottom: 8 }}>
        {!ready && <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: ".78rem" }}>جاري تحميل الخريطة...</div>}
      </div>
    </div>
  );
}

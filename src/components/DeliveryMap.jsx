import { useState, useRef, useEffect } from "react";

const TILES = {
  street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export default function DeliveryMap({ onSelect }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tileRef = useRef(null);
  const [mapType, setMapType] = useState("street");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function tryInit() {
      if (mapRef.current) return;
      if (!window.L) { setTimeout(tryInit, 200); return; }
      if (!divRef.current) return;
      try {
        const map = window.L.map(divRef.current, {
          zoomControl: true, attributionControl: false,
        }).setView([35.1318, 36.7580], 13);
        tileRef.current = window.L.tileLayer(TILES.street).addTo(map);
        map.on("click", e => place(map, e.latlng.lat, e.latlng.lng));
        mapRef.current = map;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 300);
      } catch (e) { console.error("DeliveryMap", e); }
    }
    tryInit();
    return () => {
      if (mapRef.current) { try { mapRef.current.remove(); } catch { } mapRef.current = null; }
    };
  }, []);

  function place(map, lat, lng) {
    if (markerRef.current) { try { markerRef.current.remove(); } catch { } }
    markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(map)
      .bindPopup("موقعك ✓").openPopup();
    markerRef.current.on("dragend", ev => {
      const p = ev.target.getLatLng();
      onSelect({ lat: p.lat.toFixed(5), lng: p.lng.toFixed(5) });
    });
    onSelect({ lat: lat.toFixed(5), lng: lng.toFixed(5) });
  }

  function switchLayer(t) {
    if (!mapRef.current || t === mapType) return;
    if (tileRef.current) { try { tileRef.current.remove(); } catch { } }
    tileRef.current = window.L.tileLayer(TILES[t]).addTo(mapRef.current);
    setMapType(t);
  }

  async function doSearch(e) {
    e.preventDefault();
    if (!search.trim() || !mapRef.current) return;
    setBusy(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + " حماة سوريا")}&limit=1`
      );
      const d = await r.json();
      if (d[0]) {
        const { lat, lon } = d[0];
        mapRef.current.flyTo([+lat, +lon], 16, { duration: 1.2 });
        place(mapRef.current, +lat, +lon);
      }
    } finally { setBusy(false); }
  }

  return (
    <div>
      <form onSubmit={doSearch} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن منطقتك في حماة..."
          style={{
            flex: 1, padding: "8px 12px", fontSize: ".8rem",
            background: "#161616", border: "1px solid #252525",
            borderRadius: 10, color: "#E5D3B3",
            fontFamily: "inherit", outline: "none"
          }} />
        <button type="submit" disabled={busy}
          style={{
            padding: "8px 13px", background: "#C8A96A",
            border: "none", borderRadius: 9, color: "#0f0f0f",
            cursor: "pointer", fontWeight: 700, fontFamily: "inherit",
            fontSize: ".78rem", flexShrink: 0, opacity: busy ? .6 : 1
          }}>
          {busy ? "..." : "بحث"}
        </button>
      </form>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[["street", "🗺 عادية"], ["satellite", "🛰 قمر"]].map(([k, l]) => (
          <button key={k} onClick={() => switchLayer(k)}
            style={{
              flex: 1, padding: "6px",
              background: mapType === k ? "#C8A96A1a" : "#141414",
              border: `1px solid ${mapType === k ? "#C8A96A" : "#252525"}`,
              borderRadius: 7, color: mapType === k ? "#C8A96A" : "#444",
              cursor: "pointer", fontFamily: "inherit",
              fontSize: ".72rem", fontWeight: 600
            }}>
            {l}
          </button>
        ))}
      </div>
      <div ref={divRef} style={{
        width: "100%", height: 230, borderRadius: 13,
        border: "1px solid #C8A96A22", overflow: "hidden",
        background: "#111", marginBottom: 8
      }}>
        {!ready && (
          <div style={{
            height: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#333", fontSize: ".78rem"
          }}>
            جاري تحميل الخريطة...
          </div>
        )}
      </div>
    </div>
  );
}

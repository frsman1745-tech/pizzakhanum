// src/features/menu/SummaryScreen.jsx

import { useState } from "react";
import useUiStore   from "../../store/uiStore.js";
import useCartStore from "../../store/cartStore.js";
import { BranchMap, DeliveryMap } from "../../components/maps/Maps.jsx";

export default function SummaryScreen() {
  const { setScreen } = useUiStore();
  const { items: cart, updateQty, removeItem } = useCartStore();
  const cartTotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.numericPrice * i.qty, 0));

  const [phone,        setPhone]        = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [locationTxt,  setLocationTxt]  = useState("");
  const [mapCoords,    setMapCoords]    = useState(null);
  const [errors,       setErrors]       = useState({});

  const wappNum     = localStorage.getItem("site_whatsapp") || "963998950904";
  const fmt         = (n) => n.toLocaleString("ar-EG");
  const phoneValid  = /^\d{10}$/.test(phone.trim());
  const canCheckout = phoneValid && deliveryType && (deliveryType !== "delivery" || locationTxt.trim());

  function checkout() {
    const errs = {};
    if (!phoneValid)                                      errs.phone    = true;
    if (!deliveryType)                                    errs.delivery = true;
    if (deliveryType === "delivery" && !locationTxt.trim()) errs.location = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const lines = cart.map((i) => `• ${i.label}${i.size ? ` (${i.size})` : ""} × ${i.qty}\n  ${i.details}\n  السعر: ${i.priceOld || i.numericPrice.toLocaleString()} ل.س`).join("\n\n");
    const msg   = [
      "مرحباً بيتزا خانم 🍕", "",
      "📋 الطلب:", lines, "",
      `💰 المجموع: ${fmt(cartTotal)} ل.س`,
      `🚗 ${deliveryType === "pickup" ? "استلام من الفرع" : "توصيل"}`,
      deliveryType === "delivery" ? `📍 ${locationTxt}${mapCoords ? `\n🗺 https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}` : ""}` : "",
      " ", `📞 ${phone}`,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${wappNum}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", paddingBottom: 50 }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0d0d0d", borderBottom: "1px solid var(--border-subtle)", padding: "12px 15px", display: "flex", alignItems: "center", gap: 11 }}>
        <button onClick={() => setScreen("menu")} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0 }}>‹</button>
        <h2 style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-primary)" }}>ملخّص الطلب</h2>
      </div>

      <div style={{ padding: "16px 15px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 20px" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 12, opacity: .16 }}>🛒</div>
            <p style={{ color: "var(--gold-dark)", fontSize: ".85rem", marginBottom: 18 }}>لا يوجد طلبات بعد</p>
            <button className="btn-gold" onClick={() => setScreen("menu")} style={{ padding: "11px 26px", borderRadius: 30, fontSize: ".83rem", fontWeight: 700, color: "#0f0f0f" }}>تصفّح القائمة</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: ".6rem", color: "var(--gold-dark)", letterSpacing: "2px", marginBottom: 11 }}>الطلبات ({cart.length})</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
              {cart.map((item) => (
                <div key={item.uid} style={{ background: "#141414", border: "1px solid var(--border-subtle)", borderRadius: 13, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: ".84rem" }}>{item.label}{item.size && ` (${item.size})`}</p>
                      <p style={{ fontSize: ".6rem", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.details}</p>
                    </div>
                    <div style={{ textAlign: "left", marginRight: 9, flexShrink: 0 }}>
                      <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--gold)" }}>{item.numericPrice.toLocaleString()} ل.س</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #222", borderRadius: 9, overflow: "hidden" }}>
                      <button onClick={() => updateQty(item.uid, -1)} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", width: 32, height: 30, fontSize: "1rem", fontFamily: "var(--font)" }}>−</button>
                      <span style={{ width: 28, textAlign: "center", fontSize: ".82rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.uid, +1)} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", width: 32, height: 30, fontSize: "1rem", fontFamily: "var(--font)" }}>+</button>
                    </div>
                    <span style={{ fontSize: ".78rem", color: "var(--gold)", fontWeight: 700 }}>{fmt(item.numericPrice * item.qty)} ل.س</span>
                    <button onClick={() => removeItem(item.uid)} style={{ background: "#180f0f", border: "1px solid #2a1818", borderRadius: 7, color: "#6a2a2a", cursor: "pointer", width: 30, height: 30, fontSize: ".8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 13, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--gold-dark)", fontSize: ".83rem" }}>المجموع</span>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--gold)" }}>{fmt(cartTotal)} ل.س</div>
            </div>

            {/* Delivery type */}
            <p style={{ fontSize: ".6rem", color: errors.delivery ? "var(--red)" : "var(--gold-alpha-30)", letterSpacing: "2px", marginBottom: 9 }}>
              {errors.delivery ? "⚠ هذا الحقل إلزامي" : "طريقة الاستلام *"}
            </p>
            <div style={{ display: "flex", gap: 9, marginBottom: 14 }}>
              {[{ v: "pickup", l: "🏪 استلام من الفرع" }, { v: "delivery", l: "🛵 توصيل" }].map((o) => (
                <button key={o.v} className={`del-btn${deliveryType === o.v ? " is-active" : ""}`} onClick={() => { setDeliveryType(o.v); setErrors((e) => ({ ...e, delivery: false })); }}>
                  {o.l}
                </button>
              ))}
            </div>

            {deliveryType === "pickup" && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: ".6rem", color: "var(--gold-alpha-30)", letterSpacing: "2px", marginBottom: 10 }}>📍 موقع الفرع</p>
                <div style={{ background: "#141414", border: "1px solid var(--gold-alpha-10)", borderRadius: 13, padding: 13 }}>
                  <p style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--gold)", marginBottom: 3 }}>بيتزا خانم — حماة</p>
                  <p style={{ fontSize: ".66rem", color: "var(--gold-dark)", marginBottom: 12 }}>حماة — سوريا</p>
                  <BranchMap />
                </div>
              </div>
            )}

            {deliveryType === "delivery" && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: ".6rem", color: errors.location ? "var(--red)" : "var(--gold-alpha-30)", letterSpacing: "2px", marginBottom: 9 }}>
                  {errors.location ? "⚠ حدد موقعك" : "📍 حدد موقعك على الخريطة *"}
                </p>
                <DeliveryMap onSelect={(coords) => { setMapCoords(coords); setLocationTxt(`https://maps.google.com/?q=${coords.lat},${coords.lng}`); setErrors((ev) => ({ ...ev, location: false })); }} />
                {mapCoords && <div style={{ background: "#0d1a0d", border: "1px solid var(--green-alpha)", borderRadius: 9, padding: "7px 12px", marginBottom: 9, fontSize: ".7rem", color: "var(--green)" }}>✓ تم تحديد موقعك</div>}
                <p style={{ fontSize: ".62rem", color: "#333", marginBottom: 7 }}>أو اكتب العنوان يدوياً</p>
                <textarea rows={2} placeholder="المحافظة، الحي، الشارع..." value={mapCoords ? "" : locationTxt}
                  onChange={(e) => { setLocationTxt(e.target.value); setMapCoords(null); setErrors((ev) => ({ ...ev, location: false })); }}
                  style={{ resize: "none", width: "100%", padding: "10px 12px", background: "#161616", border: `1px solid ${errors.location ? "var(--red)" : "#252525"}`, borderRadius: 10, color: "var(--text-primary)", fontFamily: "var(--font)", fontSize: ".82rem", outline: "none" }} />
              </div>
            )}

            {/* Phone */}
            <p style={{ fontSize: ".6rem", color: errors.phone ? "var(--red)" : "var(--gold-alpha-30)", letterSpacing: "2px", marginBottom: 7 }}>
              {errors.phone ? "⚠ رقم الهاتف إلزامي" : "رقم الهاتف *"}
            </p>
            <input type="tel" placeholder="09xxxxxxxx" value={phone} maxLength={10}
              onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setPhone(v); setErrors((ev) => ({ ...ev, phone: false })); }}
              style={{ width: "100%", padding: "10px 12px", background: "#161616", border: `1px solid ${errors.phone || (phone.length > 0 && phone.length !== 10) ? "var(--red)" : "#252525"}`, borderRadius: 10, color: "var(--text-primary)", fontFamily: "var(--font)", fontSize: ".86rem", outline: "none", marginBottom: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: ".58rem", color: "var(--text-disabled)" }}>10 أرقام بالضبط</p>
              <span style={{ fontSize: ".58rem", fontWeight: 700, color: phone.length === 0 ? "#222" : phone.length === 10 ? "var(--green)" : "var(--red)" }}>{phone.length}/10</span>
            </div>

            <button className="btn-gold" disabled={!canCheckout} onClick={checkout}
              style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: ".9rem", fontWeight: 700, color: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
              <span style={{ fontSize: "1rem" }}>📲</span>إرسال الطلب عبر واتساب
            </button>
            {!canCheckout && (
              <p style={{ textAlign: "center", fontSize: ".6rem", color: "var(--text-disabled)", marginTop: 7 }}>
                {!phoneValid ? (phone.length === 0 ? "أدخل رقم هاتفك" : "الرقم يجب أن يكون 10 أرقام") : !deliveryType ? "اختر طريقة الاستلام" : "أدخل موقعك لإتمام الطلب"}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

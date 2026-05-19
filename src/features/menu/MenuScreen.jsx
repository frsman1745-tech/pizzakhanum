// src/features/menu/MenuScreen.jsx

import { useState, useRef, useEffect, useMemo } from "react";
import useUiStore    from "../../store/uiStore.js";
import useCartStore  from "../../store/cartStore.js";
import { useMenu, useFeatured, useSections } from "../../hooks/usePizzas.js";
import { DEFAULT_MENU, DEFAULT_FEATURED, DEFAULT_SECTIONS } from "../../constants/defaults.js";
import FeaturedSlider from "../../components/pizza/FeaturedSlider.jsx";
import PizzaImg       from "../../components/pizza/PizzaImg.jsx";

export default function MenuScreen() {
  const { setScreen, setBuilderPizza, setDetailPizza, setKhanamSize, goToMenu } = useUiStore();
  const { items: cart } = useCartStore();
  const cartTotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.numericPrice * i.qty, 0));

  const { data: menuData }     = useMenu();
  const { data: featuredData } = useFeatured();
  const { data: sectionsData } = useSections();

  const pizzasMenu   = menuData     || DEFAULT_MENU;
  const featured     = featuredData || DEFAULT_FEATURED;
  const menuSections = useMemo(
    () => (sectionsData?.length ? [...sectionsData].sort((a, b) => a.sortOrder - b.sortOrder) : DEFAULT_SECTIONS),
    [sectionsData]
  );

  const siteName = localStorage.getItem("site_name") || "بيتزا خانم";
  const fmt = (n) => n.toLocaleString("ar-EG");

  const [activeSection, setActiveSection] = useState("");
  const sectionRefs = useRef({});

  // Scroll Spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.dataset.sectionId || "");
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [menuSections, pizzasMenu]);

  function scrollToSection(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }

  function handleFeaturedClick(fp) {
    setBuilderPizza(fp);
    if (fp.sizes?.length && !fp.sliceCount) {
      setKhanamSize(null);
      setScreen("khanum");
    } else {
      setScreen("builder");
    }
  }

  function handleMenuItemClick(p) {
    if (p.comingSoon) return;
    setDetailPizza(p);
    setScreen("pizza_detail");
  }

  const grouped = menuSections.map((sec) => ({
    ...sec,
    items: pizzasMenu.filter((p) => p.menuSection === sec.id),
  }));
  const unsectioned = pizzasMenu.filter(
    (p) => !p.menuSection || !menuSections.find((s) => s.id === p.menuSection)
  );

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", paddingBottom: 100 }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: "var(--z-sticky)", background: "var(--bg-base)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ padding: "12px 15px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 900, background: "linear-gradient(90deg,var(--gold),var(--gold-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {siteName}
          </span>
          <button
            onClick={() => setScreen("summary")}
            style={{ position: "relative", background: "#1a1a1a", border: "1px solid var(--gold-alpha-10)", borderRadius: 9, color: "var(--gold)", padding: "7px 12px", cursor: "pointer", fontSize: ".76rem", fontFamily: "var(--font)" }}
          >
            🧾 الطلب
            {cart.length > 0 && (
              <span style={{ position: "absolute", top: -5, left: -5, background: "var(--gold)", color: "#0f0f0f", borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".55rem", fontWeight: 700 }}>
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Section tabs */}
        {menuSections.length > 0 && (
          <div className="sec-tabs" style={{ paddingBottom: 10 }}>
            {grouped.filter((s) => s.items.length > 0).map((sec) => (
              <button key={sec.id} className={`sec-tab${activeSection === sec.id ? " is-active" : ""}`} onClick={() => scrollToSection(sec.id)}>
                <span>{sec.emoji}</span>{sec.label}
              </button>
            ))}
            {unsectioned.length > 0 && (
              <button className={`sec-tab${activeSection === "__other__" ? " is-active" : ""}`} onClick={() => scrollToSection("__other__")}>
                🍕 أخرى
              </button>
            )}
          </div>
        )}
      </div>

      {/* Featured slider */}
      <div style={{ paddingTop: 16 }}>
        <p style={{ fontSize: ".6rem", color: "var(--gold-alpha-30)", letterSpacing: "3px", padding: "0 15px 9px" }}>⭐ العروض المميّزة</p>
        <FeaturedSlider featured={featured} onCardClick={handleFeaturedClick} />
      </div>

      {/* Menu sections */}
      <div style={{ padding: "20px 15px 0" }}>
        {grouped.filter((s) => s.items.length > 0).map((sec) => (
          <div key={sec.id} ref={(el) => (sectionRefs.current[sec.id] = el)} data-section-id={sec.id} style={{ marginBottom: 28 }}>
            <p style={{ fontSize: ".6rem", color: "var(--gold-alpha-30)", letterSpacing: "3px", marginBottom: 12 }}>{sec.emoji} {sec.label.toUpperCase()}</p>
            <PizzaGrid items={sec.items} onItemClick={handleMenuItemClick} />
          </div>
        ))}

        {unsectioned.length > 0 && (
          <div ref={(el) => (sectionRefs.current["__other__"] = el)} data-section-id="__other__" style={{ marginBottom: 28 }}>
            <p style={{ fontSize: ".6rem", color: "var(--gold-alpha-30)", letterSpacing: "3px", marginBottom: 12 }}>🍕 القائمة</p>
            <PizzaGrid items={unsectioned} onItemClick={handleMenuItemClick} />
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {cart.length > 0 && (
        <div className="cart-fab">
          <button className="btn-gold pop-in" onClick={() => setScreen("summary")}
            style={{ padding: "12px 24px", borderRadius: "var(--radius-pill)", fontSize: ".86rem", fontWeight: 700, color: "#0f0f0f", boxShadow: "0 8px 28px #00000099", display: "flex", alignItems: "center", gap: 9 }}>
            <span>🧾 عرض الطلب</span>
            <span style={{ background: "rgba(15,15,15,.22)", borderRadius: 20, padding: "2px 9px", fontSize: ".78rem" }}>{fmt(cartTotal)} ل.س</span>
          </button>
        </div>
      )}
    </div>
  );
}

function PizzaGrid({ items, onItemClick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
      {items.map((p) => (
        <div
          key={p.id || p._id}
          className={p.comingSoon ? "" : "card-tap"}
          style={{ background: "#131313", border: "1px solid var(--border-default)", borderRadius: 13, overflow: "hidden", cursor: p.comingSoon ? "default" : "pointer", opacity: p.comingSoon ? 0.5 : 1 }}
          onClick={() => onItemClick(p)}
        >
          <PizzaImg imageUrl={p.imageUrl} label={p.label} style={{ width: "100%", height: 88, borderRadius: 0 }} />
          <div style={{ padding: "8px 8px 10px" }}>
            <p style={{ fontSize: ".74rem", fontWeight: 600, color: p.comingSoon ? "var(--text-muted)" : "var(--text-primary)", marginBottom: 3 }}>{p.label}</p>
            {p.comingSoon
              ? <span style={{ fontSize: ".55rem", background: "var(--gold-alpha-10)", color: "rgba(200,169,106,.47)", padding: "2px 7px", borderRadius: 19 }}>قريباً</span>
              : <p style={{ fontSize: ".58rem", color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.details}</p>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

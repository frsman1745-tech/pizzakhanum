// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";

// Route based on URL path
const isAdmin = window.location.pathname.startsWith("/admin");

async function bootstrap() {
  const { default: Root } = isAdmin
    ? await import("./Admin.jsx")
    : await import("./App.jsx");

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <Root />
    </StrictMode>
  );
}

bootstrap();

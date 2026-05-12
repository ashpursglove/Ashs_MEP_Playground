import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { runSplashNarration } from "./splash";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// The splash sits on top of the React root with `position: fixed` so the
// editor is free to mount and warm up while the narration plays out. The
// narration controls its own dismiss — we don't need to coordinate here.
void runSplashNarration().catch((err) => {
  console.warn("splash narration failed", err);
  document.getElementById("splash")?.remove();
});

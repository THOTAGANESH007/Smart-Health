import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import NotificationPermission from "./components/firebase/NotificationPermission.jsx";
import NotificationHandler from "./components/firebase/NotificationHandler.jsx";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      // console.log("✅ Service Worker registered:", registration);
    })
    .catch((error) => {
      console.error("❌ Service Worker registration failed:", error);
    });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationPermission
        onTokenReceived={(token) => {
          // console.log("✅ FCM Token received:", token);
        }}
      />

      <NotificationHandler />
      <App />
    </BrowserRouter>
  </StrictMode>
);

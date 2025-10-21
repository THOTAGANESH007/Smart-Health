import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import NotificationPermission from "./components/firebase/NotificationPermission.jsx";
import NotificationHandler from "./components/firebase/NotificationHandler.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationPermission
        onTokenReceived={(token) => {
          console.log("✅ FCM Token received:", token);
          // TODO: Send this token to your backend via API
        }}
      />

     
      <NotificationHandler />
      <App />
    </BrowserRouter>
  </StrictMode>
);

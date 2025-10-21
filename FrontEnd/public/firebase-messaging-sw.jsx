importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js"
);

let firebaseConfig;

// Fetch config dynamically
self.addEventListener("install", (event) => {
  event.waitUntil(
    fetch("/firebase-config.json")
      .then((res) => res.json())
      .then((config) => {
        firebase.initializeApp(config);
        const messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
          console.log("📨 Background message:", payload);
          const { title, body } = payload.notification;
          self.registration.showNotification(title, { body });
        });
      })
      .catch((err) => console.error("⚠️ Failed to load Firebase config:", err))
  );
});

// Import Firebase compat libraries for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js"
);

// Initialize Firebase inside the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCqp39It-TRz0cOvh-7ZldSRyHaic2eRX0",
  authDomain: "smart-health-7cc9b.firebaseapp.com",
  projectId: "smart-health-7cc9b",
  storageBucket: "smart-health-7cc9b.firebasestorage.app",
  messagingSenderId: "1065704600415",
  appId: "1:1065704600415:web:a8c966e5b9533b75c83cea",
  measurementId: "G-PRWZ7ZTEWK",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  // console.log("📨 Background message received:", payload);

  const { title, body } = payload.notification || {};
  const options = {
    body: body || "You have a new notification.",
    // icon: "/favicon.ico",
  };

  // Show the notification
  self.registration.showNotification(title || "Notification", options);
});

// config.example.js
// Copia este archivo a `config.local.js` y reemplaza los valores con los de tu proyecto Firebase.
// Luego incluye `config.local.js` en tu HTML antes de `auth.js`:
// <script src="/config.local.js"></script>
// <script src="/auth.js"></script>

window.TURISCO_CONFIG = {
  firebaseConfig: {
    apiKey: "REPLACE_WITH_YOUR_API_KEY",
    authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
    projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
    storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_YOUR_APP_ID"
  }
};

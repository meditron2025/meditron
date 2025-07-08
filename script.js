// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe9mUjwaZvPPpnPwfm6Xcd1uutJLzev10",
  authDomain: "meditron-pill-dispenser.firebaseapp.com",
  projectId: "meditron-pill-dispenser",
  storageBucket: "meditron-pill-dispenser.firebasestorage.app",
  messagingSenderId: "582584026049",
  appId: "1:582584026049:web:dacbe477519dbfa978e540"
};

// ✅ Initialize Firebase (only once)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// ✅ Login function with doctor restriction
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const allowedEmails = ["doctor1@meditron.com", "doctor2@meditron.com"];

  if (!allowedEmails.includes(email)) {
    document.getElementById("message").innerText = "❌ Access denied: Unauthorized email";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("message").innerText = "✅ Login successful!";
      // ✅ Delay then redirect to dashboard
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    })
    .catch((error) => {
      document.getElementById("message").innerText = `❌ ${error.message}`;
    });
}

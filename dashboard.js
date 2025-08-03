// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCe9mUjwaZvPPpnPwfm6Xcd1uutJLzev10",
  authDomain: "meditron-pill-dispenser.firebaseapp.com",
  projectId: "meditron-pill-dispenser",
  storageBucket: "meditron-pill-dispenser.appspot.com",
  messagingSenderId: "582584026049",
  appId: "1:582584026049:web:dacbe477519dbfa978e540"
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show which doctor is logged in
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const doctorEmail = user.email;
    document.getElementById("logged-in-doctor").innerText = "Logged in as: " + doctorEmail;
  } else {
    window.location.href = "index.html"; // redirect to login if not logged in
  }
});

// Logout function
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  }).catch(error => {
    alert("Error logging out: " + error.message);
  });
}

// ✅ Display only ACTIVE patients dynamically
function loadPatientButtons() {
  const container = document.getElementById("patientGrid"); // updated to match HTML

  db.collection("patients")
    .where("status", "==", "active")
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        container.innerHTML = "<p>No active patients found.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const patientId = doc.id;
        const patientData = doc.data();

        const btn = document.createElement("button");
        btn.className = "patient-button"; // reuse your existing style
        btn.innerText = patientData.name || patientId;
        btn.onclick = () => {
          window.location.href = `patient.html?patientId=${patientId}`;
        };

        container.appendChild(btn);
      });
    })
    .catch(error => {
      console.error("Error loading patients:", error);
      container.innerHTML = "<p>Error loading patients.</p>";
    });
}

window.onload = loadPatientButtons;

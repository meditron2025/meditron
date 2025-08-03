// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCe9mUjwaZvPPpnPwfm6Xcd1uutJLzev10",
  authDomain: "meditron-pill-dispenser.firebaseapp.com",
  projectId: "meditron-pill-dispenser",
  storageBucket: "meditron-pill-dispenser.appspot.com",
  messagingSenderId: "582584026049",
  appId: "1:582584026049:web:dacbe477519dbfa978e540"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Simple password-based login
function checkPassword() {
  const input = document.getElementById("ward-password").value;
  if (input === "ward123") {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("content").style.display = "block";
    loadPrescriptions();
  } else {
    document.getElementById("login-error").innerText = "Incorrect password.";
  }
}

// Load and display all prescriptions
function loadPrescriptions() {
  const container = document.getElementById("patient-list");
  db.collection("patients").get().then(snapshot => {
    if (snapshot.empty) {
      container.innerHTML = "<p>No patients found.</p>";
      return;
    }

    const now = new Date();
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.classList.add("patient-card");

      // Check for recent update
      let updateNotice = "";
      if (data.prescriptionHistory && data.prescriptionHistory.length > 0) {
        const lastEntry = data.prescriptionHistory[data.prescriptionHistory.length - 1];
        if (lastEntry.updatedAt) {
          const updatedTime = new Date(lastEntry.updatedAt);
          const timeDiff = (now - updatedTime) / (1000 * 60 * 60); // in hours
          if (timeDiff < 24) {
            updateNotice = `<p class="blink" style="color: green; font-weight: bold;">🔔 New update available!</p>`;
          }
        }
      }

      div.innerHTML = `
        <h3>Patient ID: ${doc.id}</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Diagnosis:</strong> ${data.diagnosis || 'N/A'}</p>
        ${updateNotice}
        <h4>Prescriptions:</h4>
        ${generatePrescriptionTable(data.prescriptions || [])}
      `;

      container.appendChild(div);
   

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

// Show logged-in doctor
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("logged-in-doctor").innerText = "Logged in as: " + user.email;
  } else {
    window.location.href = "index.html";
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  }).catch(error => {
    alert("Error logging out: " + error.message);
  });
}

// Load only admitted patients
function loadPatientButtons() {
  const container = document.getElementById("patient-buttons");
  container.innerHTML = "";

  db.collection("patients").where("status", "==", "admitted").get().then(snapshot => {
    if (snapshot.empty) {
      container.innerHTML = "<p>No admitted patients.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const patientId = doc.id;
      const data = doc.data();

      const div = document.createElement("div");
      div.className = "patient-button";
      div.innerHTML = `
        <strong>${patientId}</strong> - ${data.name || "Unnamed"}<br>
        <button onclick="viewPatient('${patientId}')">View</button>
        <button onclick="dischargePatient('${patientId}')">Discharge</button>
      `;
      container.appendChild(div);
    });
  });
}

function viewPatient(patientId) {
  window.location.href = `patient.html?patientId=${patientId}`;
}

function dischargePatient(patientId) {
  if (!confirm(`Are you sure you want to discharge ${patientId}?`)) return;

  db.collection("patients").doc(patientId).update({ status: "discharged" }).then(() => {
    alert("Patient discharged.");
    loadPatientButtons();
  }).catch(err => {
    alert("Error discharging: " + err.message);
  });
}

// Add new patient
document.getElementById("add-patient-form").addEventListener("submit", e => {
  e.preventDefault();

  const id = document.getElementById("new-id").value.trim();
  const name = document.getElementById("new-name").value.trim();
  const age = parseInt(document.getElementById("new-age").value.trim());
  const gender = document.getElementById("new-gender").value;
  const diagnosis = document.getElementById("new-diagnosis").value.trim();

  if (!id || !name || isNaN(age) || !gender) {
    document.getElementById("add-status").innerText = "Please fill all required fields.";
    return;
  }

  db.collection("patients").doc(id).set({
    name,
    age,
    gender,
    diagnosis,
    prescriptions: [],
    status: "admitted",
    prescriptionHistory: []
  }).then(() => {
    document.getElementById("add-status").style.color = "green";
    document.getElementById("add-status").innerText = "Patient added successfully.";
    document.getElementById("add-patient-form").reset();
    loadPatientButtons();
  }).catch(err => {
    document.getElementById("add-status").style.color = "red";
    document.getElementById("add-status").innerText = "Error adding patient: " + err.message;
  });
});

window.onload = loadPatientButtons;

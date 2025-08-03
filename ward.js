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

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.classList.add("patient-card");

      // Check if updated recently (within 24 hours)
      const updatedAt = data.prescriptionHistory?.length
        ? data.prescriptionHistory[data.prescriptionHistory.length - 1].updatedAt
        : null;

      let isRecentlyUpdated = false;
      if (updatedAt) {
        const updatedDate = new Date(updatedAt);
        const now = new Date();
        const diffHours = (now - updatedDate) / (1000 * 60 * 60);
        if (diffHours <= 24) {
          isRecentlyUpdated = true;
        }
      }

      div.innerHTML = `
        <h3>
          Patient ID: ${doc.id}
          ${isRecentlyUpdated ? '<span style="color: red; font-size: 16px;">🆕 Updated</span>' : ''}
        </h3>
        <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
        <p><strong>Diagnosis:</strong> ${data.diagnosis || 'N/A'}</p>
        <h4>Latest Prescription:</h4>
        ${generatePrescriptionTable(data.prescriptions || [])}
      `;

      container.appendChild(div);
    });
  });
}

// Generate HTML table from latest prescription array
function generatePrescriptionTable(prescriptions) {
  if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
    return "<p>No prescriptions.</p>";
  }

  let table = `
    <table>
      <tr>
        <th>Medication</th>
        <th>Dosage</th>
        <th>Time</th>
      </tr>
  `;

  prescriptions.forEach(p => {
    table += `
      <tr>
        <td>${p.name}</td>
        <td>${p.dose}</td>
        <td>${Array.isArray(p.times) ? p.times.join(", ") : ''}</td>
      </tr>
    `;
  });

  table += `</table>`;
  return table;
}

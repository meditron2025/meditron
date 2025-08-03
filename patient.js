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

const patientId = localStorage.getItem("selectedPatient");
const detailsDiv = document.getElementById("patient-details");

if (patientId) {
  db.collection("patients").doc(patientId).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();

      let prescriptionHtml = "<ul>";
      if (Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
        data.prescriptions.forEach(p => {
          prescriptionHtml += `<li><strong>${p.name}</strong>: ${p.dose || 'N/A'} (${(p.times || []).join(', ')})</li>`;
        });
        prescriptionHtml += "</ul>";
      } else {
        prescriptionHtml = "N/A";
      }

      // ✅ Generate history HTML
      const historyHtml = generatePrescriptionHistoryTable(data.prescriptionHistory || []);

      detailsDiv.innerHTML = `
        <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
        <p><strong>Age:</strong> ${data.age || 'N/A'}</p>
        <p><strong>Gender:</strong> ${data.gender || 'N/A'}</p>
        <p><strong>Diagnosis:</strong> ${data.diagnosis || 'N/A'}</p>
        <p><strong>Prescriptions:</strong><br>${prescriptionHtml}</p>
        <button onclick="window.location.href='update.html?patientId=${patientId}'">Update Medical Records</button>
        <hr>
        <h3>Prescription History</h3>
        ${historyHtml}
      `;
    } else {
      detailsDiv.innerHTML = "<p>Patient not found in database.</p>";
    }
  }).catch(err => {
    detailsDiv.innerHTML = "<p>Error: " + err.message + "</p>";
  });
} else {
  detailsDiv.innerHTML = "<p>No patient selected.</p>";
}

// ✅ Function to generate history table
function generatePrescriptionHistoryTable(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return "<p>No previous prescriptions.</p>";
  }

  let html = "";

  history.forEach((entry, index) => {
    const timestamp = new Date(entry.updatedAt).toLocaleString();

    html += `
      <div class="history-entry">
        <h4>Prescription ${index + 1} (Updated: ${timestamp})</h4>
        <p><strong>Diagnosis:</strong> ${entry.diagnosis || 'N/A'}</p>
        <table>
          <tr><th>Medication</th><th>Dosage</th><th>Time</th></tr>
          ${entry.prescriptions.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.dose}</td>
              <td>${Array.isArray(p.times) ? p.times.join(", ") : ''}</td>
            </tr>
          `).join("")}
        </table>
      </div>
      <hr>
    `;
  });

  return html;
}


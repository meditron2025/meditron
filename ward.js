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

// Load and display all prescriptions (excluding discharged patients)
function loadPrescriptions() {
  const container = document.getElementById("patient-list");
  db.collection("patients")
    .where("status", "==", "admitted") // 🔍 Show only admitted patients
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        container.innerHTML = "<p>No patients found.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.classList.add("patient-card");

        // Check if recently updated (within 1 day)
        const lastUpdated = data.prescriptionHistory?.length
          ? data.prescriptionHistory[data.prescriptionHistory.length - 1].updatedAt
          : null;

        let updateNotice = "";
        if (lastUpdated) {
          const lastUpdateTime = new Date(lastUpdated).getTime();
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;

          if (now - lastUpdateTime <= oneDay) {
            const uniqueId = `notice-${doc.id}`;
            updateNotice = `<p id="${uniqueId}" class="blink" style="color: green; font-weight: bold;">🔔 New update available!</p>`;

            // Stop blinking after 10 seconds
            setTimeout(() => {
              const el = document.getElementById(uniqueId);
              if (el) el.classList.remove("blink");
            }, 10000);
          }
        }

        div.innerHTML = `
          <h3>Patient ID: ${doc.id}</h3>
          ${updateNotice}
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Diagnosis:</strong> ${data.diagnosis || 'N/A'}</p>
          <h4>Prescriptions:</h4>
          ${generatePrescriptionTable(data.prescriptions || [])}
        `;

        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error loading prescriptions:", err);
    });
}

// Generate HTML table from prescription array
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

  table += "</table>";
  return table;
}

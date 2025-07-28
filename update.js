import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  // 🔁 Replace with your actual config
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Medications list
const medications = [
  "Panadol", "Losartan", "Metformin", "Aspirin", "Clopidogrel",
  "Statin", "Penicillin", "Diuretics", "Sulfonylurea"
];

// Step 1: Generate medication fields dynamically
function createMedicationFields() {
  const container = document.getElementById("medications");
  medications.forEach((med) => {
    container.innerHTML += `
      <div class="medication-group">
        <input type="checkbox" id="${med}-check">
        <label for="${med}-check">${med}</label><br>
        <div class="dose">
          Dose: <input type="text" id="${med}-dose" placeholder="e.g., 500mg"><br>
        </div>
        <div class="times">
          Time:
          <input type="checkbox" name="${med}-time" value="Morning"> Morning
          <input type="checkbox" name="${med}-time" value="Afternoon"> Afternoon
          <input type="checkbox" name="${med}-time" value="Night"> Night
        </div>
      </div>
    `;
  });
}

// Step 2: Load current patient data
async function loadPatientData() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patientId");

  if (!patientId) {
    document.getElementById("message").textContent = "Invalid patient ID.";
    return;
  }

  const docRef = doc(db, "patients", patientId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Populate diagnosis
    document.getElementById("diagnosis").value = data.diagnosis || "";

    // Populate medications
    if (data.prescriptions && Array.isArray(data.prescriptions)) {
      data.prescriptions.forEach((med) => {
        if (document.getElementById(`${med.name}-check`)) {
          document.getElementById(`${med.name}-check`).checked = true;
          document.getElementById(`${med.name}-dose`).value = med.dose || "";

          med.times?.forEach((time) => {
            const timeBoxes = document.getElementsByName(`${med.name}-time`);
            timeBoxes.forEach((box) => {
              if (box.value === time) {
                box.checked = true;
              }
            });
          });
        }
      });
    }
  } else {
    document.getElementById("message").textContent = "Patient not found.";
  }
}

// Step 3: Save updated data
document.getElementById("update-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patientId");

  const diagnosis = document.getElementById("diagnosis").value.trim();

  const updatedPrescriptions = [];

  medications.forEach((med) => {
    const isChecked = document.getElementById(`${med}-check`).checked;
    if (isChecked) {
      const dose = document.getElementById(`${med}-dose`).value.trim();
      const timeBoxes = document.getElementsByName(`${med}-time`);
      const selectedTimes = [];
      timeBoxes.forEach((box) => {
        if (box.checked) selectedTimes.push(box.value);
      });

      updatedPrescriptions.push({
        name: med,
        dose,
        times: selectedTimes
      });
    }
  });

  try {
    await updateDoc(doc(db, "patients", patientId), {
      diagnosis: diagnosis,
      prescriptions: updatedPrescriptions
    });

    document.getElementById("message").style.color = "green";
    document.getElementById("message").textContent = "Records updated successfully!";
  } catch (error) {
    document.getElementById("message").style.color = "red";
    document.getElementById("message").textContent = "Error updating records.";
    console.error("Error updating:", error);
  }
});

// Load everything
createMedicationFields();
loadPatientData();

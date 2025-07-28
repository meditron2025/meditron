import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCe9mUjwaZvPPpnPwfm6Xcd1uutJLzev10",
  authDomain: "meditron-pill-dispenser.firebaseapp.com",
  databaseURL: "https://meditron-pill-dispenser-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "meditron-pill-dispenser",
  storageBucket: "meditron-pill-dispenser.firebasestorage.app",
  messagingSenderId: "582584026049",
  appId: "1:582584026049:web:dacbe477519dbfa978e540"
};

// ✅ Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ List of medications
const medicationList = [
  "Panadol", "Losartan", "Metformin", "Aspirin", "Clopidogrel",
  "Statin", "Penicillin", "Diuretics", "Sulfonylurea"
];

// ✅ Get patient ID from URL
const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get("patientId");

// ✅ DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  renderMedications();
  // Delay to ensure medication fields exist
  setTimeout(() => {
    loadPatientData();
  }, 100);
});

// ✅ Reference to form and display area
const form = document.getElementById("update-form");
const message = document.getElementById("message");
const medicationsDiv = document.getElementById("medications");
const diagnosisField = document.getElementById("diagnosis");

// ✅ Create medication fields
function renderMedications() {
  medicationsDiv.innerHTML = "";

  medicationList.forEach((med) => {
    const block = document.createElement("div");
    block.className = "medication-block";

    block.innerHTML = `
      <label>
        <input type="checkbox" name="medications" value="${med}"> ${med}
      </label><br>
      Dosage: <input type="text" name="dosage-${med}" placeholder="e.g. 500mg"><br>
      Time:
      <label><input type="checkbox" name="time-${med}" value="Morning"> Morning</label>
      <label><input type="checkbox" name="time-${med}" value="Afternoon"> Afternoon</label>
      <label><input type="checkbox" name="time-${med}" value="Night"> Night</label>
    `;

    medicationsDiv.appendChild(block);
  });
}

// ✅ Load existing data
async function loadPatientData() {
  if (!patientId) {
    message.style.color = "red";
    message.textContent = "❌ No patient ID found in URL.";
    return;
  }

  try {
    const docRef = doc(db, "patients", patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      diagnosisField.value = data.diagnosis || "";

      if (Array.isArray(data.prescriptions)) {
        data.prescriptions.forEach((presc) => {
          const medCheckbox = document.querySelector(`input[name="medications"][value="${presc.name}"]`);
          const doseInput = document.querySelector(`input[name="dosage-${presc.name}"]`);
          const timeCheckboxes = document.querySelectorAll(`input[name="time-${presc.name}"]`);

          if (medCheckbox) medCheckbox.checked = true;
          if (doseInput) doseInput.value = presc.dose || "";
          if (timeCheckboxes) {
            timeCheckboxes.forEach(cb => {
              if (presc.times && presc.times.includes(cb.value)) {
                cb.checked = true;
              }
            });
          }
        });
      }
    } else {
      message.style.color = "red";
      message.textContent = "❌ Patient record not found.";
    }
  } catch (err) {
    console.error("Error loading patient data:", err);
    message.style.color = "red";
    message.textContent = "❌ Error loading data: " + err.message;
  }
}

// ✅ Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedDiagnosis = diagnosisField.value.trim();
  const updatedPrescriptions = [];

  medicationList.forEach((med) => {
    const isSelected = document.querySelector(`input[name="medications"][value="${med}"]`)?.checked;

    if (isSelected) {
      const dose = document.querySelector(`input[name="dosage-${med}"]`)?.value.trim() || "";
      const times = Array.from(document.querySelectorAll(`input[name="time-${med}"]:checked`))
                         .map(cb => cb.value);

      updatedPrescriptions.push({
        name: med,
        dose: dose,
        times: times
      });
    }
  });

  try {
    const docRef = doc(db, "patients", patientId);
    await updateDoc(docRef, {
      diagnosis: updatedDiagnosis,
      prescriptions: updatedPrescriptions
    });

    message.style.color = "green";
    message.textContent = "✅ Prescription updated successfully!";
  } catch (err) {
    console.error("Update error:", err);
    message.style.color = "red";
    message.textContent = "❌ Error updating: " + err.message;
  }
});


// ✅ Render everything
renderMedications();
loadPatientData();


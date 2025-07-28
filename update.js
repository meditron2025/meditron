import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCe9mUjwaZvPPpnPwfm6Xcd1uutJLzev10",
  authDomain: "meditron-pill-dispenser.firebaseapp.com",
  projectId: "meditron-pill-dispenser",
  storageBucket: "meditron-pill-dispenser.appspot.com",
  messagingSenderId: "582584026049",
  appId: "1:582584026049:web:dacbe477519dbfa978e540"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// List of medications
const medicationList = [
  "Panadol", "Losartan", "Metformin", "Aspirin", "Clopidogrel",
  "Statin", "Penicillin", "Diuretics", "Sulfonylurea"
];

// Get patient ID from URL
const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get("patientId");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("update-form");
  const message = document.getElementById("message");
  const medicationsDiv = document.getElementById("medications");
  const diagnosisField = document.getElementById("diagnosis");

  if (!patientId) {
    message.style.color = "red";
    message.textContent = "❌ No patient ID in URL.";
    return;
  }

  // Render medications
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

  // Load existing patient data
  async function loadPatientData() {
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
        message.textContent = "❌ Patient not found.";
      }
    } catch (err) {
      console.error("Error loading:", err);
      message.style.color = "red";
      message.textContent = "❌ Error: " + err.message;
    }
  }

  // Submit form
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

  // Load everything
  renderMedications();
  loadPatientData();
});

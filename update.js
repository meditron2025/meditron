import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get patient ID from URL
const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get("patientId");

// Form and message reference
const form = document.getElementById("update-form");
const msg = document.getElementById("message");
const diagnosisField = document.getElementById("diagnosis");

// Medications list
const medications = [
  "Panadol",
  "Losartan",
  "Metformin",
  "Aspirin",
  "Clopidogrel",
  "Statin",
  "Penicillin",
  "Diuretics",
  "Sulfonylurea"
];

// Load existing data
async function loadPatientData() {
  const docRef = doc(db, "patients", patientId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Load diagnosis
    diagnosisField.value = data.diagnosis || "";

    // Load prescriptions
    const prescriptions = data.prescriptions || [];
    prescriptions.forEach((med) => {
      const checkbox = document.getElementById(`${med.name}-check`);
      const doseInput = document.getElementById(`${med.name}-dose`);
      const timeInputs = document.querySelectorAll(`input[name="${med.name}-time"]`);

      if (checkbox) checkbox.checked = true;
      if (doseInput) doseInput.value = med.dose;

      timeInputs.forEach((timeInput) => {
        if (med.times && med.times.includes(timeInput.value)) {
          timeInput.checked = true;
        }
      });
    });
  }
}

loadPatientData();

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prescriptions = [];

  const diagnosis = diagnosisField.value.trim();

  medications.forEach((med) => {
    const isChecked = document.getElementById(`${med}-check`).checked;
    if (isChecked) {
      const dose = document.getElementById(`${med}-dose`).value.trim();
      const timeCheckboxes = document.querySelectorAll(`input[name="${med}-time"]:checked`);
      const times = Array.from(timeCheckboxes).map(cb => cb.value);

      prescriptions.push({
        name: med,
        dose,
        times
      });
    }
  });

  try {
    await updateDoc(doc(db, "patients", patientId), {
      diagnosis,
      prescriptions
    });

    msg.style.color = "green";
    msg.innerText = "Records updated successfully!";
  } catch (error) {
    msg.style.color = "red";
    msg.innerText = "Error updating: " + error.message;
    console.error("Update error:", error);
  }
});



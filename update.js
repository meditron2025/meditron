import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Medications list
const medicationList = [
  "Panadol", "Losartan", "Metformin", "Aspirin", "Clopidogrel",
  "Statin", "Penicillin", "Diuretics", "Sulfonylurea"
];

// Get patient ID from URL
const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get("patientId");

const form = document.getElementById("update-form");
const message = document.getElementById("message");
const medicationsDiv = document.getElementById("medications");
const diagnosisField = document.getElementById("diagnosis");

// Dynamically generate medication fields
medicationList.forEach(name => {
  const div = document.createElement("div");
  div.className = "medication-block";

  div.innerHTML = `
    <label><input type="checkbox" name="medication" value="${name}"> ${name}</label><br>
    Dose: <input type="text" class="dose" data-name="${name}" placeholder="e.g. 500mg"><br>
    Time:
      <label><input type="checkbox" class="time" data-name="${name}" value="Morning"> Morning</label>
      <label><input type="checkbox" class="time" data-name="${name}" value="Afternoon"> Afternoon</label>
      <label><input type="checkbox" class="time" data-name="${name}" value="Night"> Night</label>
  `;

  medicationsDiv.appendChild(div);
});

// On form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const diagnosis = diagnosisField.value.trim();
  const selected = [];

  const checkedMedications = document.querySelectorAll("input[name='medication']:checked");

  checkedMedications.forEach(med => {
    const name = med.value;

    const doseInput = document.querySelector(`.dose[data-name="${name}"]`);
    const dose = doseInput ? doseInput.value.trim() : "";

    const timeInputs = document.querySelectorAll(`.time[data-name="${name}"]:checked`);
    const times = Array.from(timeInputs).map(t => t.value);

    selected.push({ name, dose, times });
  });

  try {
    const patientRef = doc(db, "patients", patientId);
    await updateDoc(patientRef, {
      diagnosis: diagnosis,
      prescriptions: selected
    });

    message.textContent = "✅ Records updated successfully!";
    message.style.color = "green";
  } catch (error) {
    console.error("Error updating:", error);
    message.textContent = "❌ Error updating: " + error.message;
    message.style.color = "red";
  }
});

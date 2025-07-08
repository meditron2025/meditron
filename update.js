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

// Medication list
const meds = [
  "Panadol", "Losartan", "Metformin", "Aspirin", "Clopidogrel",
  "Statin", "Penicillin", "Diuretics", "Sulfonylurea"
];

// Get patientId from URL
const params = new URLSearchParams(window.location.search);
const patientId = params.get("patientId");

// Load existing data and generate form
async function loadForm() {
  const docRef = db.collection("patients").doc(patientId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    document.getElementById("message").innerText = "Patient not found!";
    return;
  }

  const data = docSnap.data();
  const existingPrescriptions = data.prescriptions || [];
  const diagnosis = data.diagnosis || "";

  // Fill existing diagnosis
  document.getElementById("diagnosis").value = diagnosis;

  // Create form
  const medDiv = document.getElementById("medications");

  meds.forEach(med => {
    const existing = existingPrescriptions.find(p => p.name === med);
    const dose = existing?.dose || "";
    const times = existing?.times || [];

    const html = `
      <div style="margin-bottom: 10px;">
        <label style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" name="med" value="${med}" ${existing ? "checked" : ""}> <strong>${med}</strong>
          Dose: <input type="text" name="dose-${med}" value="${dose}" placeholder="e.g. 500mg" style="width: 100px;">
          Time:
          <label><input type="checkbox" name="time-${med}-morning" ${times.includes("Morning") ? "checked" : ""}> M</label>
          <label><input type="checkbox" name="time-${med}-afternoon" ${times.includes("Afternoon") ? "checked" : ""}> A</label>
          <label><input type="checkbox" name="time-${med}-night" ${times.includes("Night") ? "checked" : ""}> N</label>
        </label>
      </div>`;
    medDiv.insertAdjacentHTML('beforeend', html);
  });
}

window.onload = loadForm;

// Submit form
document.getElementById("update-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const diagnosis = document.getElementById("diagnosis").value.trim();

  const formData = new FormData(e.target);
  const prescriptions = [];

  meds.forEach(med => {
    if (formData.getAll("med").includes(med)) {
      const dose = formData.get(`dose-${med}`) || "";
      const times = [];
      if (formData.get(`time-${med}-morning`)) times.push("Morning");
      if (formData.get(`time-${med}-afternoon`)) times.push("Afternoon");
      if (formData.get(`time-${med}-night`)) times.push("Night");

      prescriptions.push({
        name: med,
        dose,
        times
      });
    }
  });

  try {
    await db.collection("patients").doc(patientId).update({
      diagnosis,
      prescriptions
    });
    document.getElementById("message").innerText = "Records updated successfully!";

    // ✅ Send email alert using EmailJS
    emailjs.send("service_fwqcg5u", "template_ee8zwdl", {
      patient_id: patientId,
      message: `Prescription updated for ${patientId}. Please check ward panel.`,
      doctor: "Doctor 1"
    })
    .then(function(response) {
      console.log("✅ Email sent!", response.status, response.text);
    }, function(error) {
      console.error("❌ Failed to send email:", error);
    });

  } catch (err) {
    document.getElementById("message").innerText = "Error updating: " + err.message;
  }
});

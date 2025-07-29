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

const params = new URLSearchParams(window.location.search);
const patientId = params.get("patientId");

document.getElementById("prescription-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const diagnosis = document.getElementById("diagnosis").value;
  const medications = [
    "Panadol", "Losartan", "Metformin", "Aspirin", "Clopidogrel",
    "Statin", "Penicillin", "Diuretics", "Sulfonylurea"
  ];

  const prescriptions = medications.map(name => {
    const isChecked = document.getElementById(name).checked;
    if (!isChecked) return null;

    return {
      name,
      dose: document.getElementById(`${name}-dose`).value || "N/A",
      times: [
        document.getElementById(`${name}-morning`).checked ? "Morning" : null,
        document.getElementById(`${name}-afternoon`).checked ? "Afternoon" : null,
        document.getElementById(`${name}-night`).checked ? "Night" : null
      ].filter(Boolean)
    };
  }).filter(Boolean);

  try {
    const patientRef = db.collection("patients").doc(patientId);
    const doc = await patientRef.get();

    if (!doc.exists) {
      document.getElementById("status").innerText = "Error: Patient not found.";
      return;
    }

    const currentData = doc.data();
    const timestamp = new Date().toISOString();

    const historyEntry = {
      diagnosis: currentData.diagnosis || "",
      prescriptions: currentData.prescriptions || [],
      updatedAt: timestamp
    };

    await patientRef.update({
      diagnosis,
      prescriptions,
      prescriptionHistory: firebase.firestore.FieldValue.arrayUnion(historyEntry)
    });

    document.getElementById("status").style.color = "green";
    document.getElementById("status").innerText = "Prescription updated successfully.";

  } catch (err) {
    document.getElementById("status").style.color = "red";
    document.getElementById("status").innerText = "Error updating: " + err.message;
  }
});


  // Load everything
  renderMedications();
  loadPatientData();
});

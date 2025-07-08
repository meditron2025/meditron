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

      detailsDiv.innerHTML = `
        <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
        <p><strong>Age:</strong> ${data.age || 'N/A'}</p>
        <p><strong>Gender:</strong> ${data.gender || 'N/A'}</p>
        <p><strong>Diagnosis:</strong> ${data.diagnosis || 'N/A'}</p>
        <p><strong>Prescriptions:</strong><br>${prescriptionHtml}</p>
        <button onclick="window.location.href='update.html?patientId=${patientId}'">Update Medical Records</button>
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


const db = firebase.firestore();
const patientButtonsDiv = document.getElementById('patientButtons');
const historyContainer = document.getElementById('historyContainer');

// STEP 1: Load patient IDs (assumes patients are named patient1 to patient6)
const patientIds = ['patient1', 'patient2', 'patient3', 'patient4', 'patient5', 'patient6'];

patientIds.forEach(id => {
  const btn = document.createElement('button');
  btn.className = 'patient-button';
  btn.innerText = id.charAt(0).toUpperCase() + id.slice(1);
  btn.onclick = () => loadHistory(id);
  patientButtonsDiv.appendChild(btn);
});

// STEP 2: Load history for a patient
function loadHistory(patientId) {
  historyContainer.innerHTML = `<p>Loading history for ${patientId}...</p>`;

  db.collection('patients').doc(patientId).get().then(doc => {
    if (!doc.exists) {
      historyContainer.innerHTML = `<p>No patient found with ID ${patientId}</p>`;
      return;
    }

    const data = doc.data();
    const history = data.history || [];

    if (history.length === 0) {
      historyContainer.innerHTML = `<p>No history available for ${patientId}.</p>`;
      return;
    }

    historyContainer.innerHTML = `<h3>History for ${patientId}</h3>`;

    history.forEach((record, index) => {
      const div = document.createElement('div');
      div.className = 'record';

      const prescriptionsHTML = record.prescriptions.map(p => {
        return `<li>${p.name} - ${p.dose} (${p.times?.join(', ') || 'No time specified'})</li>`;
      }).join('');

      div.innerHTML = `
        <h4>Update ${index + 1} — ${new Date(record.updatedAt).toLocaleString()}</h4>
        <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
        <ul>${prescriptionsHTML}</ul>
      `;
      historyContainer.appendChild(div);
    });
  }).catch(error => {
    console.error('Error loading history:', error);
    historyContainer.innerHTML = `<p>Error loading history: ${error.message}</p>`;
  });
}

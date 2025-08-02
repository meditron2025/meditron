const db = firebase.firestore();

const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get('patientId');

const container = document.getElementById('historyContainer');

db.collection('patients').doc(patientId).get()
  .then(doc => {
    if (!doc.exists) {
      container.innerHTML = 'Patient not found.';
      return;
    }

    const data = doc.data();
    const history = data.history || [];

    if (history.length === 0) {
      container.innerHTML = 'No history records found.';
      return;
    }

    container.innerHTML = '';

    history.forEach((entry, index) => {
      const entryDiv = document.createElement('div');
      entryDiv.classList.add('entry');

      const date = new Date(entry.updatedAt).toLocaleString();

      let html = `<strong>Record ${index + 1}</strong><br><strong>Date:</strong> ${date}<br>`;
      html += `<strong>Diagnosis:</strong> ${entry.diagnosis || 'N/A'}<br>`;
      html += `<strong>Prescriptions:</strong><ul>`;

      (entry.prescriptions || []).forEach(p => {
        html += `<li><strong>${p.name}</strong>: ${p.dose || 'N/A'} (${(p.times || []).join(', ')})</li>`;
      });

      html += '</ul>';

      entryDiv.innerHTML = html;
      container.appendChild(entryDiv);
    });
  })
  .catch(error => {
    console.error('Error loading history:', error);
    container.innerHTML = 'Error loading history.';
  });

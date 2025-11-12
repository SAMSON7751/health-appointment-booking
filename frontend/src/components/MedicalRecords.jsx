import React, { useEffect, useState } from 'react';

export default function MedicalRecords({ patientId }) {
  const [record, setRecord] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/medical-records/${patientId}`)
      .then(r => r.json())
      .then(setRecord)
      .catch(() => setRecord(null));
  }, [patientId]);

  if (!record) return <div className="card"><h3>Medical Records</h3><p>No records found.</p></div>;

  return (
    <div className="card">
      <h3>Medical Records for {record.name}</h3>
      <p><strong>Conditions:</strong> {record.conditions.join(', ')}</p>
      <p><strong>Medications:</strong> {record.medications.join(', ')}</p>
    </div>
  );
}

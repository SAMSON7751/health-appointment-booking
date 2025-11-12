import React, { useEffect, useState } from 'react';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/appointments')
      .then(r => r.json())
      .then(setAppointments)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      <h3>Upcoming Appointments</h3>
      <ul>
        {appointments.map(a => (
          <li key={a.id}>{a.time} — {a.patientName} (Patient #{a.patientId}) — {a.status}</li>
        ))}
      </ul>
    </div>
  );
}

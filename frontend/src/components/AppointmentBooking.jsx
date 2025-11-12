import React, { useState, useEffect } from 'react';

export default function AppointmentBooking({ patientId, patientName }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('1');
  const [time, setTime] = useState('2025-11-20T10:00');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/doctors')
      .then(r => r.json())
      .then(setDoctors)
      .catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const doctor = doctors.find(d => String(d.id) === String(doctorId));
    try {
      const res = await fetch('http://localhost:4000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, patientName, doctorId: doctor.id, doctorName: doctor.name, time })
      });
      const data = await res.json();
      setMessage('Appointment scheduled (id: ' + data.id + ')');
    } catch (err) {
      setMessage('Error scheduling appointment');
    }
  };

  return (
    <section className="card">
      <h3>Book Appointment</h3>
      <form onSubmit={submit}>
        <label>
          Doctor
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
            ))}
          </select>
        </label>
        <label>
          Date & time
          <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        </label>
        <button type="submit">Schedule</button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
}

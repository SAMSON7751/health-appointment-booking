import React, { useState } from 'react';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';

export default function App() {
  const [role, setRole] = useState('patient'); 

  return (
    <div className="app">
      <header className="header">
        <h1>Health Appointment Booking</h1>
        <div className="role-switch">
          <label>
            <input type="radio" checked={role === 'patient'} onChange={() => setRole('patient')} /> Patient
          </label>
          <label>
            <input type="radio" checked={role === 'doctor'} onChange={() => setRole('doctor')} /> Doctor
          </label>
        </div>
      </header>
      <main className="main">
        {role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
      </main>
    </div>
  );
}

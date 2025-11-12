import React from 'react';
import AppointmentBooking from './AppointmentBooking';
import MedicalRecords from './MedicalRecords';

export default function PatientDashboard() {
  
  return (
    <div>
      <h2>Patient Dashboard</h2>
      <AppointmentBooking patientId={1} patientName="Abraham" />
      <MedicalRecords patientId={1} />
    </div>
  );
}

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());


let appointments = [
  { id: 1, patientId: 1, patientName: 'Abraham', doctorId: 1, doctorName: 'Dr. Smith', time: '2025-11-20T10:00:00Z', status: 'scheduled' }
];

let doctors = [
  { id: 1, name: 'Dr. Dereje', specialty: 'General Practitioner' },
  { id: 2, name: 'Dr. Samson', specialty: 'Dermatology' }
];

let medicalRecords = {
  1: { patientId: 1, name: 'Abraham', conditions: ['Hypertension'], medications: ['Lisinopril'] }
};


app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});


app.post('/api/appointments', (req, res) => {
  const { patientId, patientName, doctorId, doctorName, time } = req.body;
  const id = appointments.length ? appointments[appointments.length - 1].id + 1 : 1;
  const appt = { id, patientId, patientName, doctorId, doctorName, time, status: 'scheduled' };
  appointments.push(appt);
  res.status(201).json(appt);
});


app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});


app.get('/api/medical-records/:patientId', (req, res) => {
  const id = req.params.patientId;
  const rec = medicalRecords[id];
  if (!rec) return res.status(404).json({ message: 'Not found' });
  res.json(rec);
});

app.listen(PORT, () => {
  console.log(`Mock API server listening on http://localhost:${PORT}`);
});

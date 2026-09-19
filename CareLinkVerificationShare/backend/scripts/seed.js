require('dotenv').config();
const connectDB = require('../config/db');
const Hospital = require('../models/Hospital');
const SystemSetting = require('../models/SystemSetting');

async function run() {
  await connectDB();
  const hospitals = [
    {
      name: 'Teaching Hospital Kurunegala',
      address: 'Kurunegala, North Western Province, Sri Lanka',
      district: 'Kurunegala', town: 'Kurunegala',
      location: { lat: 7.479096, lng: 80.35914 },
      isActive: true,
    },
    {
      name: 'Kurunegala Hospital',
      address: 'Kurunegala, North Western Province, Sri Lanka',
      district: 'Kurunegala', town: 'Kurunegala',
      location: { lat: 7.478422, lng: 80.359839 },
      isActive: true,
    },
  ];
  for (const hospital of hospitals) {
    await Hospital.updateOne({ name: hospital.name }, { $set: hospital }, { upsert: true });
  }
  const settings = [
    ['ratePerKm', 120, 'Distance charge rate per kilometer in LKR'],
    ['caretakerServiceCharge', 1500, 'Base caretaker service charge in LKR'],
    ['adminFeePercent', 15, 'Admin service fee percentage'],
  ];
  for (const [key, value, description] of settings) {
    await SystemSetting.updateOne({ key }, { $set: { value, description } }, { upsert: true });
  }
  console.log('CareLink+ seed completed');
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });

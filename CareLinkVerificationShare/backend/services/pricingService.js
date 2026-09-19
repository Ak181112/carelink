const SystemSetting = require("../models/SystemSetting");

const DEFAULTS = {
  ratePerKm: 120,
  caretakerServiceCharge: 1500,
  adminFeePercent: 15,
};

async function getPricingSettings() {
  const keys = Object.keys(DEFAULTS);
  const rows = await SystemSetting.find({ key: { $in: keys } });
  const values = { ...DEFAULTS };
  for (const row of rows) values[row.key] = Number(row.value);
  return values;
}

function calculateTotal({ distanceKm, ratePerKm, caretakerServiceCharge, adminFeePercent }) {
  const distanceCharge = Number((distanceKm * ratePerKm).toFixed(2));
  const base = Number((distanceCharge + caretakerServiceCharge).toFixed(2));
  const adminFeeAmount = Number((base * (adminFeePercent / 100)).toFixed(2));
  const total = Number((base + adminFeeAmount).toFixed(2));
  return { distanceCharge, adminFeeAmount, total };
}

module.exports = { DEFAULTS, getPricingSettings, calculateTotal };

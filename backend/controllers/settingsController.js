const SystemSetting = require("../models/SystemSetting");
const { DEFAULTS } = require("../services/pricingService");
async function getSettings(req, res, next) { try { let rows = await SystemSetting.find({}); const map = { ...DEFAULTS }; rows.forEach(r => { map[r.key] = r.value; }); res.json({ success: true, settings: map }); } catch (e) { next(e); } }
async function updateSettings(req, res, next) { try { const allowed = ["ratePerKm","caretakerServiceCharge","adminFeePercent"]; for (const key of allowed) if (req.body[key] !== undefined) await SystemSetting.findOneAndUpdate({ key }, { value: Number(req.body[key]) }, { upsert:true, new:true, setDefaultsOnInsert:true }); const rows = await SystemSetting.find({}); const settings={...DEFAULTS}; rows.forEach(r=>settings[r.key]=r.value); res.json({ success:true, settings }); } catch(e){next(e);} }
module.exports={getSettings,updateSettings};

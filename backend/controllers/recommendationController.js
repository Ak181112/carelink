const CaretakerProfile = require("../models/CaretakerProfile");
const Booking = require("../models/Booking");
const Feedback = require("../models/Feedback");
const { computeRoadDistance } = require("../services/mapsService");

async function recommend(req, res, next) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const distanceEnabled = Number.isFinite(lat) && Number.isFinite(lng);
    const caretakers = await CaretakerProfile.find({ applicationStatus:"approved", isVerified:true }).populate("userId","name email phone").lean();
    const out=[];
    for(const c of caretakers){
      const availabilityScore=c.isAvailable?100:0;
      let distanceScore=50; let distanceKm=null;
      if(distanceEnabled && c.location?.lat != null && c.location?.lng != null){
        const route=await computeRoadDistance({lat,lng},c.location);
        distanceKm=route.distanceKm;
        distanceScore=Math.max(0,Math.min(100,100-(distanceKm*10)));
      }
      const ratingScore=Math.max(0,Math.min(100,(c.averageRating||0)*20));
      const completedServices=await Booking.countDocuments({caretakerId:c.userId?._id||c.userId,status:{ $in:["paid","closed"] }});
      const completedScore=Math.min(100,completedServices*10);
      const previousInteraction=await Feedback.exists({caretakerId:c.userId?._id||c.userId,clientId:req.user._id})?100:50;
      const score=(availabilityScore*0.30)+(distanceScore*0.25)+(ratingScore*0.20)+(completedScore*0.15)+(previousInteraction*0.10);
      out.push({caretaker:c,recommendationScore:Number(score.toFixed(2)),factors:{availability:availabilityScore,location:distanceScore,rating:ratingScore,completedServices:completedScore,previousInteraction},distanceKm});
    }
    out.sort((a,b)=>b.recommendationScore-a.recommendationScore);
    res.json({success:true,recommendations:out});
  }catch(e){next(e);}
}
module.exports={recommend};

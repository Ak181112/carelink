require("dotenv").config();
const { checkGoogleRoutes } = require("../services/mapsService");

const [originLat, originLng, destinationLat, destinationLng] = process.argv.slice(2).map(Number);

if (![originLat, originLng, destinationLat, destinationLng].every(Number.isFinite)) {
  console.error("Usage: npm run check:routes -- <originLat> <originLng> <destinationLat> <destinationLng>");
  console.error("Example: npm run check:routes -- 7.32828 80.02438 7.47131 80.04481");
  process.exit(1);
}

(async () => {
  const result = await checkGoogleRoutes(
    { lat: originLat, lng: originLng },
    { lat: destinationLat, lng: destinationLng },
  );

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 2);
})().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});

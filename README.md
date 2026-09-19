CareLink+ - Smart Parent Care Management System

## Technology

- Frontend: Next.js / React / TypeScript / Tailwind CSS
- Backend: Node.js / Express.js
- Database: MongoDB / Mongoose
- Authentication: JWT with role-based access control
- Mapping: Google Routes API + Geocoding, with a development Haversine fallback when no Google key is configured
- Payments: Stripe Checkout + Stripe Connect
- File storage: Cloudinary when configured; local development fallback is retained for environments without Cloudinary credentials
- OCR: Google Cloud Vision API when configured, with Tesseract fallback
- Version control: Git / GitHub

## Implemented business flow

1. Client selects a parent profile.
2. Client selects a pickup location using device location or address lookup.
3. Available hospitals are returned and ordered by road distance.
4. Caretaker recommendations are scored using the proposal's weighted formula.
5. Booking quote shows road distance, distance charge, caretaker service charge, 15% admin fee, and total.
6. Caretaker accepts or rejects the booking.
7. Caretaker generates an OTP and the family receives the secure code.
8. OTP verification starts the visit.
9. Caretaker progresses the service through:
   - Task Started
   - At Hospital
   - Consultation Completed
   - Back to Home
   - Task Completed
10. Both caretaker and client must confirm completion.
11. The client is then sent to Stripe Checkout.
12. After successful payment, a receipt summary is displayed and the client proceeds to feedback.
13. Feedback updates the caretaker profile rating/review history.
14. Emergency alerts notify the client, caretaker, and administrators.
15. Admin can manage settings, bookings, payments, contact messages, feedback, and platform withdrawals.

## Pricing

The pricing engine implements:

`Total = (Road Distance × Rate Per Km) + Caretaker Service Charge + Admin Service Fee`

The default seeded values are:

- Rate per km: LKR 120
- Caretaker service charge: LKR 1,500
- Admin service fee: 15%

All pricing values can be changed through the administrator settings page.

## Recommendation scoring

The recommendation engine implements the proposal weighting:

`RS = (A × 0.30) + (L × 0.25) + (R × 0.20) + (C × 0.15) + (P × 0.10)`

For clients with no previous interaction with a caretaker, the previous-interaction factor defaults to 50.

## Local setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in MongoDB/JWT and optional integration credentials
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# create frontend/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

## Stripe setup

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in the backend environment. The checkout flow uses Stripe Checkout. Caretaker payouts use Stripe Connect onboarding and payouts.

For production deployment, use a Stripe account in a Stripe-supported merchant country and configure the appropriate Connect payout capabilities for that account. Academic/demo environments can use Stripe test mode.

## Google Maps setup

Configure `GOOGLE_MAPS_API_KEY` with access to the Routes and Geocoding APIs. Without it, development falls back to Haversine distance; booking pages still work for seeded hospitals and coordinate-based location selection.

## Cloudinary setup

Configure `CLOUDINARY_URL` or the `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` variables. Uploaded caretaker profile images and verification documents are uploaded to Cloudinary and local temporary files are removed after processing.

## OCR setup

Set `GOOGLE_CLOUD_VISION_API_KEY` to use Google Vision OCR. When it is missing or unavailable, the backend falls back to Tesseract OCR. The address matching logic then compares OCR text against the caretaker profile address and can route uncertain cases for manual review.

## Enterprise engineering notes

- Role separation: administrator, family member/client, and caretaker.
- Server-side authorization is enforced for booking, payment, feedback, settings, and emergency operations.
- Sensitive integration credentials are not committed; use `.env.example` as the template.
- MongoDB indexes are defined for high-use booking/status queries.
- The UI uses responsive Tailwind layouts across mobile, tablet, and desktop breakpoints.
- Backend services are separated by concern: pricing, mapping, OCR, Cloudinary, Stripe, and notifications.
- The application is structured for Agile/Scrum sprint delivery and testable modules.

## Important dependency note

The delivered source contains the required `stripe` and `cloudinary` dependencies in `backend/package.json`. The runtime used to prepare this archive did not have network access to rebuild the npm lockfile or install node modules. Run `npm install` in both applications before the first local run; npm will refresh the backend lockfile as necessary.

# Firebase Phone Auth setup (real free SMS for QuickBite OTP)

Until you complete the steps below, the OTP modal stays in **demo mode**
(no SMS, code shown in a yellow banner). After you set the env vars,
Firebase sends real SMS to the customer's phone — free up to the Spark plan
limit (~10K verifications/month).

## 1. Create a Firebase project (5 min, free)

1. Go to https://console.firebase.google.com
2. **Add project** → name it `quickbite` (or whatever) → continue.
3. Disable Google Analytics (not needed).

## 2. Enable Phone authentication

1. Left sidebar → **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Phone** → toggle **Enable** → Save.
3. (Optional, recommended for testing) Same screen → scroll down →
   **Phone numbers for testing** → add your own phone with a fixed code
   like `123456`. You can run the flow without burning SMS quota.

## 3. Authorize the QuickBite domain

Authentication → **Settings → Authorized domains** → **Add domain**, add:
- `quickbite-frontend-hok-s-projects.vercel.app`
- `localhost` (already there)

Without this, Firebase returns `auth/unauthorized-domain` and the SMS never sends.

## 4. Get the web app config

1. **Project settings (gear icon) → General → Your apps → Add app → Web (`</>`).**
2. Nickname `quickbite-web`, no hosting, **Register**.
3. Copy the values out of the `firebaseConfig` snippet.

## 5. Set frontend env vars on Vercel

Project: **quickbite-frontend** (scope `hok-s-projects`). Add to
**Production + Preview**:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=quickbite-xxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=quickbite-xxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=quickbite-xxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=1:...
```

Redeploy the frontend (or push any commit) so the new env vars bake into the build.

## 6. Generate a service-account key for the backend

The backend verifies the Firebase ID token before it flips
`phone_verified=true`. It needs a service account.

1. **Project settings → Service accounts → Generate new private key** →
   downloads `quickbite-xxxx-firebase-adminsdk.json`.
2. Open it and copy three values: `project_id`, `client_email`, `private_key`.

## 7. Set backend env vars on Vercel

Project: **quickbite-backend** (scope `hok-s-projects`). Add to **Production**:

```
FIREBASE_PROJECT_ID=quickbite-xxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@quickbite-xxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Important: paste `FIREBASE_PRIVATE_KEY` **with `\n` written literally**
inside double quotes (Vercel's env UI lets you do this — paste the value
from the JSON file as-is including the `\n` escape sequences).

Then redeploy the backend (it's git-disconnected):

```
cd backend && npx vercel deploy --prod --yes --scope hok-s-projects
```

## 8. Test

1. Sign in as a customer.
2. Add an item, go to cart, tap **Confirm payment and address**.
3. Phone modal opens → enter your real phone in PK format
   (`03xxxxxxxxx` — frontend converts it to `+92...` for you).
4. Tap **Send SMS code** → real SMS lands within ~10s.
5. Type the code → tap **Verify & Continue** → order auto-places.

## What happens if Firebase env vars aren't set?

The frontend detects `REACT_APP_FIREBASE_API_KEY` is missing and falls
back to the demo flow (`/auth/otp/send` returns the code in the
response, the modal shows it). Nothing breaks; you just don't get real
SMS until the env vars are configured.

## Cost

Firebase Phone Auth on the Spark (free) plan covers normal demo use.
The hard limits are quota — see https://firebase.google.com/pricing.

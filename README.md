# RoadSense — Frontend

React (Vite + MUI) frontend for the RoadSense pothole/crack detection platform. Talks to the [backend API](https://github.com/iamVinothKumar27/pothole-React_backend).

## Auth

- Email/password: Firebase Authentication.
- Google sign-in: Google Identity Services (OAuth2 access-token flow) verified server-side — no Firebase involved for this path.

## Local development

```bash
npm install
cp .env.example .env   # fill in Firebase + Google OAuth client values
npm run dev
```

## Environment variables

See `.env.example`. `VITE_API_BASE_URL` should point at the backend's URL (`http://localhost:5000` locally, the deployed Render URL in production).

## Deployment

Deployed on Vercel. Build command `npm run build`, output directory `dist`. All `VITE_*` env vars must be set in the Vercel project settings.

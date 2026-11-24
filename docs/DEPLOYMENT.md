# Deployment guide: Render + Vercel + MongoDB Atlas + Razorpay

## 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas cluster and a database user with a strong password.
2. Add the Render outbound IP policy appropriate for your Atlas tier. For a quick portfolio deployment, Atlas Network Access can temporarily allow `0.0.0.0/0`; this exposes the database endpoint to all IPs, so use a strong database password and narrow the allowlist when possible.
3. Copy the Node.js connection string and replace the username, password, and database name. URL-encode special characters in the password.

## 2. Deploy the API on Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository. Render reads the root `render.yaml` and creates the backend web service.
3. Set the prompted environment values in the Render service:
   - `MONGO_URI`: Atlas connection string
   - `JWT_SECRET`: long random secret (32+ characters)
   - `CLIENT_URL`: exact Vercel frontend origin, e.g. `https://your-store.vercel.app` (no trailing slash). Multiple origins can be comma-separated.
   - `RAZORPAY_KEY_ID`: Razorpay test key ID initially
   - `RAZORPAY_KEY_SECRET`: matching Razorpay test secret
   - `RAZORPAY_WEBHOOK_SECRET`: webhook secret you choose and later enter in the Razorpay Dashboard
4. Deploy. Confirm `https://YOUR-RENDER-SERVICE.onrender.com/api/health` returns `{ "status": "ok" }`.

The API uses `PORT` provided by Render, listens on `0.0.0.0` by default through Node, and exposes `/api/health` as its health check.

## 3. Deploy the frontend on Vercel

1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Add environment variable `VITE_API_URL` with the full API base, e.g. `https://YOUR-RENDER-SERVICE.onrender.com/api`.
5. Deploy. `frontend/vercel.json` rewrites client-side routes to `index.html` so refreshes on `/orders` and `/admin` work.
6. Copy the deployed Vercel origin (e.g. `https://your-store.vercel.app`) into Render's `CLIENT_URL`, then redeploy the API if required.

## 4. Configure Razorpay webhooks

1. Use HTTPS API URL `https://YOUR-RENDER-SERVICE.onrender.com/api/payments/webhook`.
2. In Razorpay Dashboard → Account & Settings → Webhooks, create a webhook with the exact URL.
3. Enter the same secret stored as `RAZORPAY_WEBHOOK_SECRET` on Render.
4. Select `payment.captured`, `payment.failed`, and `order.paid` events.
5. Test with Razorpay test mode before switching to live keys.

## 5. Final production checklist

- Use live Razorpay credentials only after completing account activation and testing.
- Keep all server secrets in Render environment settings; never expose `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `JWT_SECRET`, or MongoDB credentials in Vercel or GitHub.
- `VITE_API_URL` is public frontend configuration; it must not contain a secret.
- Use exact allowed frontend origins in `CLIENT_URL`.
- Confirm payment verification and webhook delivery using a low-value test transaction before launch.
- Configure monitoring, backups, refund handling, stock reservation/reconciliation, privacy/terms pages, and automated tests before accepting real customer payments.

## 6. Deploy from GitHub after updates

```bash
git add .
git commit -m "Prepare MERN store for deployment"
git push origin main
```

Render and Vercel can redeploy automatically from the connected branch.

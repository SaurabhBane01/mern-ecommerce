MERN E-Commerce Website

A full-stack e-commerce portfolio application built with MongoDB, Express.js, React.js, and Node.js. It includes JWT authentication, customer/admin authorization, product management, a persistent shopping cart, order history, Razorpay Checkout, server-side payment verification, Razorpay webhooks, and an admin dashboard.

Features:-
Customer registration and login with bcrypt password hashing and JWT authentication
Role-based access control for customer and admin routes
Product catalogue, product details, search, and admin product CRUD
Browser-persisted shopping cart and server-calculated order totals
Customer order history and admin order fulfilment management
Razorpay order creation using trusted MongoDB order totals
HMAC-SHA256 Checkout signature validation and server-side Razorpay payment fetch
Razorpay webhook signature validation using the raw request body
Helmet security headers, CORS allowlist, JSON payload limits, and API/auth/payment rate limits
Responsive React interface
Render backend and Vercel frontend deployment configuration

Tech stack

**| Layer | Technologies |**
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Lucide React |
| Backend | Node.js 20+, Express 4, Mongoose |
| Database | MongoDB local or MongoDB Atlas |
| Authentication | JWT, bcryptjs, role-based middleware |
| Payments | Razorpay Node.js SDK and Checkout.js |
| Deployment | Render (API), Vercel (frontend) |

**Project structure**

**mern-ecommerce/**
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── middleware/      # JWT and role authorization
│   │   ├── models/          # User, Product, Order
│   │   ├── routes/          # Auth, products, orders, payments
│   │   ├── seed.js          # Creates a private admin and sample products
│   │   └── server.js        # Express app and startup
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── styles.css
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
├── screenshots/             # Add real app screenshots here
├── .github/workflows/ci.yml
├── render.yaml
├── SECURITY.md
├── .gitignore
└── README.md

Requirements:-
Node.js 20 or newer (Node.js 22 recommended)
npm
MongoDB local installation or MongoDB Atlas account
Razorpay account and test API keys for payment testing

Run locally

1. Clone the repository
git clone https://github.com/YOUR_USERNAME/mern-ecommerce.git
cd mern-ecommerce

2. Configure the backend
cd backend
npm install

Copy the example environment file:
powershell
Windows PowerShell
Copy-Item .env.example .env

macOS / Linux
cp .env.example .env

Edit backend/.env and set:
MONGO_URI: local MongoDB URI or Atlas connection string
JWT_SECRET: long random secret (at least 32 characters)
RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET: Razorpay test API keys
RAZORPAY_WEBHOOK_SECRET: private webhook signing secret
SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD: your own admin login; use at least 12 characters for the password

Start MongoDB locally if using the local URI. Then seed the database:
npm run seed
npm run dev
The API runs at `http://localhost:5000`.

3. Configure and run the frontend
Open a second terminal from the project root:
cd frontend
npm install
Copy 'frontend/.env.example' to 'frontend/.env' and keep 'VITE_API_URL=http://localhost:5000/api' for local development.
npm run dev
Open the Vite URL, normally `http://localhost:5173`.

Admin access:-
The seed script creates an admin account using the values you set in `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. It does not contain a hard-coded public demo password. Keep these credentials private and do not publish them in the repository or screenshots.

Razorpay payment configuration:-
1. Sign in to the [Razorpay Dashboard](https://dashboard.razorpay.com/) and generate Test Mode API keys.
2. Put the key ID and key secret in `backend/.env`.
3. Start the backend and frontend.
4. Add a product to the cart, proceed to checkout, and complete the address form.
5. The backend creates the MongoDB order and Razorpay order. The frontend opens Razorpay Checkout.
6. On Checkout success, the backend validates the signature and fetches the payment from Razorpay. It marks the MongoDB order paid only if the payment is captured and amount/currency/order ID match.

Main endpoints:-
`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
`GET /api/products`, `GET /api/products/:id`
Admin: `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
`POST /api/orders`, `GET /api/orders/my`, `GET /api/orders`, `PATCH /api/orders/:id/status`
`POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/payments/webhook`

Deployment:-
Backend: Render using the root `render.yaml`
Frontend: Vercel with root directory `frontend`
Database: MongoDB Atlas

Add a license file if you intend to publish this project for reuse. Otherwise, all rights reserved by default.

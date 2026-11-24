# ShopSphere REST API

Base URL for local development: `http://localhost:5000/api`

All request and response bodies are JSON unless noted. Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

Admin endpoints additionally require a user whose database role is `admin`.

## Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | API health check |

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create a customer account |
| POST | `/auth/login` | No | Sign in and receive a JWT |
| GET | `/auth/me` | User | Return the current user |

Register request:

```json
{
  "name": "Asha Customer",
  "email": "asha@example.com",
  "password": "use-a-private-password"
}
```

Login request:

```json
{ "email": "asha@example.com", "password": "use-a-private-password" }
```

Successful register/login returns `{ "token": "...", "user": { "id", "name", "email", "role" } }`.
Passwords must be 8–128 characters and are stored as bcrypt hashes.

## Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | No | List products; optional `?search=term` |
| GET | `/products/:id` | No | Get one product |
| POST | `/products` | Admin | Create a product |
| PUT | `/products/:id` | Admin | Update allowed product fields |
| DELETE | `/products/:id` | Admin | Delete a product |

Product fields: `name`, `description`, `price`, `image`, `category`, `stock`.

## Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | User | Create an unpaid order using current server-side product prices |
| GET | `/orders/my` | User | List the signed-in user's orders |
| GET | `/orders` | Admin | List all orders and customer summary |
| PATCH | `/orders/:id/status` | Admin | Update fulfilment status for a paid order |

Create order request:

```json
{
  "items": [{ "product": "<MongoDB product id>", "quantity": 1 }],
  "shippingAddress": {
    "name": "Asha Customer",
    "address": "12 Example Road",
    "city": "Mumbai",
    "postalCode": "400001",
    "country": "India"
  }
}
```

The API ignores browser-submitted prices and calculates totals from MongoDB product records.

## Razorpay payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-order` | User | Create a Razorpay order for a MongoDB order |
| POST | `/payments/verify` | User | Verify Checkout signature and fetch payment status from Razorpay |
| POST | `/payments/webhook` | Razorpay signature | Receive Razorpay webhook events (raw JSON body) |

Create Razorpay order request:

```json
{ "orderId": "<MongoDB order id>" }
```

The response includes `keyId`, `razorpayOrderId`, `amount` (paise), `currency`, `name`, and `description`.

Verification request is the Razorpay Checkout handler response plus the MongoDB `orderId`:

```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "...",
  "orderId": "<MongoDB order id>"
}
```

The server verifies HMAC-SHA256 using the secret key, fetches the payment from Razorpay, and checks order ID, amount, currency, and `captured` status before marking the order paid. The browser is never trusted to set the order total or payment state.

### Webhook setup

1. Deploy the backend over HTTPS.
2. In Razorpay Dashboard, open **Account & Settings → Webhooks** and add `https://YOUR-API-DOMAIN/api/payments/webhook`.
3. Set a strong webhook secret. Copy the exact same value into `RAZORPAY_WEBHOOK_SECRET` in Render.
4. Subscribe to `payment.captured`, `payment.failed`, and `order.paid`.
5. Save the webhook and use Razorpay's test event / test payment flow to confirm delivery.

The server validates `X-Razorpay-Signature` against the exact raw request bytes. Do not put the webhook route behind JWT authentication. Event IDs are retained on the order for duplicate delivery protection. Webhooks are acknowledged for unrelated events and unknown orders.

## Error responses

Typical responses use `{ "message": "..." }` with HTTP statuses such as `400` validation error, `401` missing/invalid JWT, `403` insufficient role or CORS origin, `404` missing resource, `409` conflict/state mismatch, `429` rate limit, and `500` server error.

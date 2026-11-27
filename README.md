# ShopSphere – MERN E-Commerce Website

A full-stack e-commerce application built using the MERN stack with Razorpay payment integration.


## 🚀 Technologies Used
- **Frontend:** React.js, Vite, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT
- **Payment Gateway:** Razorpay
- **Tools:** Git, GitHub, VS Code

## ✨ Key Features
- User registration and login
- JWT authentication and role-based authorization
- Product listing, search and management
- Shopping cart and checkout
- Order placement and order history
- Razorpay payment integration
- Secure payment verification and webhooks
- Admin dashboard for product and order management
- Responsive user interface

## 📁 Project Structure
```text
mern-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   │   └── App.jsx
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

## ⚙️ Installation

**1. Clone the repository**
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
git clone YOUR_GITHUB_REPOSITORY_URL
cd mern-ecommerce
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Configure backend `.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**4. Start backend**
```bash
npm run seed
npm run dev
```

**5. Install and start frontend**

Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

## 💳 Payment Integration
- Razorpay Checkout integration
- Server-side payment signature verification
- Payment status validation

Use Razorpay Test Mode for development.


## 🌐 Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB

## 🔒 Security
- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- Environment variable protection
- Payment signature verification
- API security and rate limiting

## 👨‍💻 Author
**Saurabh Bane**


## 📄 License
For educational and portfolio purposes.

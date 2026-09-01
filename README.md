# Vistream - Streaming Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Express.js-5.x-black?style=for-the-badge&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/AWS-S3-orange?style=for-the-badge&logo=amazon-aws" alt="AWS S3">
  <img src="https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge" alt="Render">
</p>

A full-stack streaming platform built with modern technologies. Features include user authentication, premium subscription via Razorpay, video streaming from S3, and an admin panel for content management.

---

## Features

### User Features
- 🔐 **Authentication** - Secure JWT-based signup/login
- 🎬 **Video Streaming** - Stream movies and shows (premium users only)
- 💳 **Subscription** - Monthly/Half-yearly premium plans via Razorpay
- 📌 **Watchlist** - Save favorite movies and shows
- 👤 **Profile** - View subscription status and manage account

### Admin Features
- 📤 **Video Management** - Upload/delete videos to AWS S3
- 👥 **User Management** - View all users and their subscription status
- 📊 **Dashboard** - View platform statistics

### Technical Features
- 🚀 **Deployment** - Next.js frontend on Vercel and Express API on Render
- ☁️ **AWS S3** - Scalable video storage with pre-signed URLs
- 🔒 **Security** - Premium validation, JWT auth, admin middleware

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16, React 19, Redux Toolkit, Tailwind CSS |
| **Backend** | Express.js 5, MongoDB (Mongoose) |
| **Database** | MongoDB Atlas |
| **Storage** | AWS S3 |
| **Payments** | Razorpay |
| **Deployment** | Vercel, Render, GitHub |
| **Other** | JWT, bcrypt, ffmpeg, SendGrid |

---

## Project Structure

```
Vistream/
├── render.yaml                 # Render backend blueprint
│
├── backend/                    # Express.js API
│   ├── server.js               # Main server entry
│   ├── .env.example            # Backend environment template
│   ├── Routes/                 # API routes
│   ├── controllers/           # Business logic
│   ├── models/                 # MongoDB models
│   ├── middleware/             # Auth & admin middleware
│   ├── services/               # S3 integration
│   ├── jobs/                   # Scheduled jobs
│   └── utils/                  # Utilities
│
└── frontend/                   # Next.js App
    ├── .env.example            # Frontend environment template
    ├── app/                    # Pages and routing
    ├── components/             # Reusable components
    ├── redux/                  # State management
    ├── lib/                    # API client & utilities
    └── public/                 # Static assets
```

---

## Prerequisites

- Node.js 20+
- npm or yarn
- MongoDB Atlas account
- AWS account (S3 + IAM user)
- Razorpay account

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Atharv7740/Vistream.git
cd Vistream
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

#### Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3332) |
| `DB_URL` | MongoDB Atlas connection string |
| `JWT_SECRET_KEY` | JWT secret key |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `AWS_REGION` | AWS region (e.g., ap-south-1) |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `S3_BUCKET_NAME` | S3 bucket name |
| `FRONTEND_URL` | Frontend URL |

```bash
# Run development server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Run development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3332/api

---

## Deployment

### Backend: Render

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/health`

Set the backend environment variables from `backend/.env.example`.

### Frontend: Vercel

- Root directory: `frontend`
- Framework: Next.js
- Build command: `npm run build`

Set `NEXT_PUBLIC_API_BASE_URL` to the Render backend origin, for example:

```bash
NEXT_PUBLIC_API_BASE_URL=https://vistream-api.onrender.com
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh token |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/video` | List all videos |
| GET | `/api/video/watch` | Stream video (premium) |
| GET | `/api/video/thumbnail` | Get video thumbnail |

### Subscription
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/plans` | Get available plans |
| POST | `/api/payment/order` | Create order |
| POST | `/api/payment/verify` | Verify payment |
| GET | `/api/payment/status` | Get subscription status |

### Admin (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/videos` | List all videos |
| POST | `/api/admin/videos/upload` | Upload video to S3 |
| DELETE | `/api/admin/videos/:id` | Delete video |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user details |

---

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Premium Validation** - Database check for active subscription
- **Admin Middleware** - Role-based access control
- **Authenticated S3 Streaming** - Premium video playback through the backend API
- **Razorpay Webhooks** - Payment verification

---

## Screenshots

> Add your screenshots here

---

## License

MIT License

---

## Author

**Atharv Tripathi**
- GitHub: [@Atharv7740](https://github.com/Atharv7740)
- Email: atharv7740@gmail.com

---

## Acknowledgments

- TMDB for movie data
- Razorpay for payment integration
- AWS S3 for video storage

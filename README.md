# 🐦 Twitter Clone Backend (Node.js + Express + MongoDB)

This is the **backend API** for a Twitter-style full-stack application, built with **Node.js**, **Express**, and **MongoDB**, designed for job application and demo purposes. It supports user authentication, post creation, likes, comments, following, notifications, search, and profile updates — all with a modular and scalable architecture.

---

## 🚀 Features

### ✅ Core Functionality

- 🔐 User authentication (JWT + cookies)
- 👤 Profile management
- 📝 Create, update, delete posts
- 💬 Comment on posts
- ❤️ Like/unlike system
- 🔔 In-app notifications
- 🤝 Follow/unfollow users
- 🔍 Search users
- 🧠 Suggested users
- 📄 Pagination + filtering (via reusable helpers)

### 🧰 Tech Stack

- **Node.js + Express**
- **MongoDB + Mongoose**
- **Joi** for request validation
- **Cloudinary** for image uploads
- **CORS + Helmet + Rate Limiting** for security

---

## 🧑‍💻 Project Structure

```
twitter-clone-backend/
│
├── controllers/       # Route logic
├── routes/            # API endpoints
├── models/            # Mongoose schemas
├── middlewares/       # Auth, error, validators
├── validations/       # Joi schemas
├── modules/           # Helpers like ModelQuery, CustomError
├── utils/             # Cloudinary, sanitization, etc.
├── app.js             # Express config and middleware setup
├── server.js          # App entry (connect DB, start server)
└── .env               # Environment config
```

---

## 🔐 Security

- JWT + cookies for authentication
- CORS with credentials
- Helmet for secure headers
- Rate limiting
- MongoDB & XSS sanitization

---

## 🔗 Frontend

The frontend of this app is available at:  
👉 [twitter-clone-client Repo](https://github.com/MkdirRaiden/twitter-clone-client.git)

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
```

---

## 🔗 Key API Endpoints

| Endpoint                                 | Description                 |
| ---------------------------------------- | --------------------------- |
| `POST /api/auth/register`                | Register a new user         |
| `POST /api/auth/login`                   | Login user                  |
| `GET /api/users/profile/:username`       | Get public profile          |
| `PATCH /api/users/profile/:username`     | Update profile              |
| `GET /api/posts`                         | Get all posts (paginated)   |
| `POST /api/posts`                        | Create a new post           |
| `GET /api/users/profile/:username/posts` | User's posts                |
| `GET /api/users/profile/:username/likes` | Liked posts                 |
| `POST /api/posts/:id/comments`           | Add comment to post         |
| `PATCH /api/users/follow/:id`            | Follow/unfollow user        |
| `GET /api/users/search?search=`          | Search users                |
| `GET /api/users/suggestions/all`         | Suggested users (paginated) |

---

## 📦 Running Locally

```bash
git clone https://github.com/your-username/twitter-clone-backend.git
cd twitter-clone-backend
npm install
npm run dev
```

Runs at `http://localhost:5000`

---

## 🧪 Testing

Use Postman or Insomnia:

- Pass JWT token via cookie or `Authorization` header.
- Most routes require authentication (`protectRoute` middleware).

---

## 🌍 Deployment

This backend is production-ready. Host the frontend separately (e.g. on **Vercel**), and the backend on services like:

- **Render**
- **Railway**
- **Fly.io**
- **DigitalOcean App Platform**

> CORS is preconfigured to support frontend-backend separation (`credentials: true`).

---

## ✨ Highlights

- Reusable `ModelQuery` for clean pagination/search
- Joi for strong request validation
- Cloudinary upload/delete integration
- Fully separated backend ready to pair with any frontend (e.g. React + TanStack Query)

---

## 📝 License

MIT — Feel free to use for job applications, portfolios, and learning.

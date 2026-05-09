# FullStack Store Rating Platform

Role-based store rating platform with an Express.js API, PostgreSQL database, Sequelize ORM, JWT auth, and a React/Vite frontend.

## Features

- Public normal-user registration and unified login for all roles
- JWT authentication with backend role guards and frontend private routes
- Admin dashboard with user/store/rating counts
- Admin user management with filtering, sorting, pagination, detail pages, and create-user flow
- Admin store management with computed average ratings and owner assignment
- Normal-user store browser with search, average rating, own rating, and submit/update star ratings
- Store-owner dashboard with average rating and sortable rater table
- Shared password-change page for all authenticated roles
- Backend and frontend validation for name, email, password, address, and rating inputs
- Dockerfiles and compose file for one-command local deployment

## Project Structure

```text
store-rating-platform/
├── backend/
│   ├── src/config/db.js
│   ├── src/config/migrate.js
│   ├── src/config/seed.js
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── src/routes/
│   └── src/server.js
├── frontend/
│   ├── src/api/
│   ├── src/components/
│   ├── src/context/
│   ├── src/pages/
│   ├── src/utils/
│   └── src/App.jsx
└── docker-compose.yml
```

## Local Setup

Create a PostgreSQL database named `store_ratings_db`, then configure the backend:

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker Setup

From this folder:

```bash
docker-compose up --build
```

The frontend will run at `http://localhost:5173` and the API at `http://localhost:3001`.

## Test Credentials

All seeded users use:

```text
Password@123
```

| Role | Email |
| --- | --- |
| Admin | admin@example.com |
| Store owner | owner1@example.com |
| Store owner | owner2@example.com |
| Store owner | owner3@example.com |
| Normal user | user1@example.com |
| Normal user | user2@example.com |
| Normal user | user3@example.com |
| Normal user | user4@example.com |
| Normal user | user5@example.com |

## API Summary

Auth:

```text
POST   /api/auth/register
POST   /api/auth/login
PATCH  /api/auth/change-password
```

Admin:

```text
GET    /api/admin/dashboard
GET    /api/admin/users?search=&role=&sortBy=name&order=asc&page=1&limit=10
GET    /api/admin/users/:id
POST   /api/admin/users
GET    /api/admin/stores?search=&sortBy=rating&order=desc&page=1&limit=10
POST   /api/admin/stores
```

Normal user:

```text
GET    /api/stores?search=
POST   /api/ratings
PATCH  /api/ratings/:id
```

Store owner:

```text
GET    /api/store-owner/dashboard?sortBy=name&order=asc
```

## Notes

- Passwords are hashed with bcrypt salt rounds of 10.
- JWT payload includes `{ userId, role }` and expires in 7 days.
- Average store ratings are computed dynamically from `ratings`, rounded to 1 decimal place, and are not stored on `stores`.
- Error responses use `{ message, statusCode }`.
- `.env` files are ignored in both apps.

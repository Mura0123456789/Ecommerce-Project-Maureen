FULL-STACK E-COMMERCE PLATFORM
================================

PROJECT SUMMARY
----------------
A full-stack e-commerce store built as a capstone project. Users can browse
products by category, search/filter/sort/paginate the catalog, view product
details and reviews, register/login, manage a shopping cart, and leave
product reviews. Admins get a dashboard to manage products and view store
statistics.

TECHNOLOGIES USED
------------------
Frontend:  React, React Router, React Query, Context API, Axios
Backend:   Node.js, Express, JWT authentication, bcryptjs, Multer, Nodemailer
Databases: PostgreSQL (via Prisma ORM) for core relational data
           (users, products, categories, cart, orders)
           MongoDB (via Mongoose) for product reviews and activity logs
Testing:   Jest + Supertest (backend), React Testing Library (frontend)
Packaging: Docker + Docker Compose

PROJECT STRUCTURE
------------------
frontend/   React application (pages, components, context, API client)
backend/    Express API (routes, controllers, middleware, Prisma schema,
            Mongo models, services)
docker-compose.yml   One-command setup for the whole stack

RUNNING THE PROJECT WITH DOCKER (RECOMMENDED)
-----------------------------------------------
1. Copy backend/.env.example to backend/.env and fill in real values
   (at minimum set a JWT_SECRET; SMTP values can stay as placeholders
   if you don't need real emails to send).
2. From the project root, run:
       docker compose up --build
3. Once containers are running, seed the database (first time only):
       docker compose exec backend npx prisma migrate deploy
       docker compose exec backend npm run seed
4. Visit:
       Frontend:     http://localhost:3000
       Backend API:  http://localhost:5000/api
       Health check: http://localhost:5000/health

RUNNING THE PROJECT
-----------------------------------------------------
Prerequisites: Node.js 20+, a running PostgreSQL instance, a running
MongoDB instance.

Backend:
  cd backend
  cp .env.example .env        # then edit DATABASE_URL / MONGO_URI to point
                               # at your local Postgres/Mongo instances
  npm install
  npx prisma migrate dev
  npm run seed
  npm run dev                 # starts on http://localhost:5000

Frontend:
  cd frontend
  cp .env.example .env
  npm install
  npm start                   # starts on http://localhost:3000

RUNNING TESTS
--------------
Backend (requires a running test database, DATABASE_URL pointed at it):
  cd backend
  npm test

Frontend:
  cd frontend
  npm test

ENVIRONMENT VARIABLES REQUIRED
--------------------------------
backend/.env  (see backend/.env.example)
  DATABASE_URL, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT, CLIENT_URL,
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

frontend/.env (see frontend/.env.example)
  REACT_APP_API_URL

TEST ACCOUNTS (created by the seed script)
---------------------------------------------
Admin:     admin@store.com    / Admin123!
Customer:  customer@store.com / Customer123!

PROJECT URLS
-------------
Frontend:     http://localhost:3000
Backend:      http://localhost:5000/api
Health Check: http://localhost:5000/health

NOTES & ASSUMPTIONS
---------------------
- Orders/checkout are modeled in the database schema (Order, OrderItem)
  but a full checkout flow was out of scope for the rubric's cart
  requirement, which only requires add/update/remove/view-total.
- Product images are stored on local disk under backend/uploads and served
  via /uploads/<filename>; the ProductImage table stores only the
  reference URL, not the binary data.
- Welcome emails use Nodemailer against whatever SMTP credentials you
  provide (e.g. an Ethereal test account) - failures to send are logged
  but never block registration.
- Backend integration tests (Jest + Supertest) cover: auth (register/login/
  duplicate email/wrong password), products (public listing, 404, unauthed
  create), cart (empty state, add, update, remove, running total, no-token
  rejection), RBAC (customer blocked from product create/delete/stats,
  malformed token rejected), and a full admin product CRUD lifecycle
  (create -> read -> update -> delete -> 404 after delete).
- Frontend tests (React Testing Library + MSW) cover: ProductListing
  (loads products/categories from the mocked API), ProductDetails (correct
  product per :id, 404 case, empty reviews state), Login (renders, submits
  against the mocked API, stores the token), and ProtectedRoute (redirects
  unauthenticated users, blocks non-admins from admin routes, allows admins
  through) - i.e. RBAC is tested on the frontend as well as the backend.
- IMPORTANT: none of this code has been executed in this environment (no
  network/Docker access here). Run `npm install && npm test` in both
  backend/ and frontend/ before you submit, and fix anything that surfaces -
  treat this as a strong first draft reviewed for logic and consistency,
  not as pre-verified working code.

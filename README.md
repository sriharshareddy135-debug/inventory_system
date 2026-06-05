# Stockr — Inventory & Order Management System

A production-ready full-stack application for managing products, customers, and orders with real-time inventory tracking.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python 3.12 + FastAPI |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |

---

## Quick Start (Docker Compose)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd inventory-system

# 2. Copy and configure environment variables
cp .env.example .env

# 3. Build and start all services
docker compose up --build

# 4. Open the app
open http://localhost        # Frontend
open http://localhost:8000/docs  # API docs (Swagger)
```

All three services (PostgreSQL, FastAPI backend, React frontend) start automatically with health checks and dependency ordering.

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database/
│   │   │   └── connection.py    # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   └── models.py        # ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── products.py      # /products CRUD
│   │       ├── customers.py     # /customers CRUD
│   │       ├── orders.py        # /orders with inventory deduction
│   │       └── dashboard.py     # /dashboard aggregates
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/index.js         # Axios API client
│   │   ├── components/          # Layout, Modal, StatCard, EmptyState
│   │   ├── pages/               # Dashboard, Products, Customers, Orders
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile               # Multi-stage: build → nginx
│   ├── nginx.conf               # SPA routing support
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders |
| POST | `/orders` | Create order (deducts stock) |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Stats + low-stock alerts |

Interactive docs available at `http://localhost:8000/docs`

---

## Business Rules Implemented

- ✅ Product SKU must be unique
- ✅ Customer email must be unique
- ✅ Product quantity cannot be negative
- ✅ Orders blocked if insufficient stock
- ✅ Creating an order automatically reduces stock
- ✅ Cancelling an order restores stock
- ✅ Total order amount calculated automatically by backend
- ✅ All APIs return proper HTTP status codes (200, 201, 204, 400, 404, 409)
- ✅ Request validation via Pydantic

---

## Deployment Guide

### Backend — Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add a **PostgreSQL** database on Render and copy the internal connection string
7. Set environment variable: `DATABASE_URL=<your-render-postgres-url>`

### Frontend — Vercel

1. Import your repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable: `VITE_API_URL=https://<your-render-backend-url>`

> ⚠️ The frontend must be **rebuilt** after setting `VITE_API_URL` since Vite bakes env vars at build time.

### Docker Hub (Backend Image)

```bash
# Build and tag
docker build -t <your-dockerhub-username>/stockr-backend:latest ./backend

# Push
docker push <your-dockerhub-username>/stockr-backend:latest
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | — |
| `POSTGRES_DB` | Database name | `inventory_db` |
| `DATABASE_URL` | Full DB connection string | — |
| `VITE_API_URL` | Backend URL for frontend | `http://localhost:8000` |

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set DATABASE_URL to a local postgres instance
export DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local

npm run dev
```

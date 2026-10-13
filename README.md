# Goodform E-commerce

A responsive storefront backed by an Express REST API and MySQL. It includes a seeded catalog, product search and filters, a persistent browser cart and wishlist, account registration/login, and authenticated order history.

- **Frontend:** React + Vite (http://localhost:5173)
- **Backend:** Node.js + Express REST API (http://localhost:5000)
- **Database:** MySQL
- **Auth:** bcrypt password hashing and HttpOnly JWT cookies
- **Styling:** Plain CSS, fully responsive

## Project structure

```text
ecommerce-project/
  frontend/
  backend/
    database/schema.sql
    src/config/db.js
    src/routes/healthRoutes.js
    src/app.js
    src/server.js
    .env.example
  .gitignore
  .env.example
  README.md
```

## Prerequisites

- Node.js 18 or later
- npm
- MySQL 8 or later

## 1. Install MySQL

Install MySQL Community Server (8.0 or later) from:
https://dev.mysql.com/downloads/installer/

During setup, create a root password if prompted. Make sure the MySQL service is running and the `mysql` client is on your PATH.

On Windows you can confirm the client with:

```bash
mysql --version
```

## 2. Create the database

Copy environment variables, then create/load the schema.

```bash
cp backend/.env.example backend/.env
```

On Windows Command Prompt, use `copy backend\.env.example backend\.env`.

Open `backend/.env` and set:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce
```

Do not commit `backend/.env`. Never put the real password in source files.

`schema.sql` creates the `ecommerce` database. That name must match `DB_NAME`.

## 3. Run schema.sql

From the project root:

```bash
mysql -u root -p < backend/database/schema.sql
```

If your root account has no password:

```bash
mysql -u root < backend/database/schema.sql
```

You can also open `backend/database/schema.sql` in MySQL Workbench and execute it.

This creates the database and tables, then inserts idempotent sample categories, products, and product images. Existing rows are not replaced.

## 4. Set database environment variables

`backend/.env` must include:

| Variable | Example | Purpose |
| --- | --- | --- |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | _(your password)_ | MySQL password |
| `DB_NAME` | `ecommerce` | Database name |

## 5. Start the backend

```bash
cd backend
npm install
npm run dev
```

API runs at http://localhost:5000

App health: http://localhost:5000/api/health

## 6. Test the database connection

With the backend running, open:

http://localhost:5000/api/health/db

Expected success response:

```json
{
  "success": true,
  "message": "Database connection is working"
}
```

If MySQL is down or `.env` is wrong, that endpoint returns HTTP 503. `/api/health` still reports that the API process is running.

## Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173

## Store features and API

- Browse and search the catalog, filter by category and price, and sort by popularity or price.
- View product details, manage a local persistent cart and wishlist, and submit a shipping address at checkout.
- Register and sign in; orders and account history require authentication.
- `GET /api/categories`
- `GET /api/products?page=1&limit=12&search=&category=&minPrice=&maxPrice=&sort=popular`
- `GET /api/products/:idOrSlug`
- `POST /api/auth/register` with `{ "name", "email", "password" }`; `POST /api/auth/login` with `{ "email", "password" }`
- `POST /api/auth/logout`; `GET /api/auth/me`
- `POST /api/orders` (authenticated) with `{ "shippingAddress", "items": [{ "productId", "quantity" }] }`
- `GET /api/orders` and `GET /api/orders/:id` (authenticated)

JWTs are sent in an HttpOnly, SameSite cookie and marked Secure in production. Set a unique `JWT_SECRET` in `backend/.env`; generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Never commit `.env` files or place real credentials in the example files.

No payment gateway is configured. Checkout records an order with `payment_status = pending`; it does not charge a customer, and the confirmation screen says so.

If product requests fail, start MySQL, load `backend/database/schema.sql`, check `backend/.env`, and verify `http://localhost:5000/api/health/db`. Build the frontend with `cd frontend; npm run build`; check backend syntax with `cd backend; node --check src/server.js`.

# E-commerce Project

Full-stack e-commerce website. Product UI, authentication, and payments will be added later.

- **Frontend:** React + Vite (http://localhost:5173)
- **Backend:** Node.js + Express REST API (http://localhost:5000)
- **Database:** MySQL
- **Auth:** JWT (added later)
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

This creates the database and all tables. It does not insert users or products.

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

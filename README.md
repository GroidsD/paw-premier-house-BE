# IAMS Backend

This is the backend service for the IAMS (Internal Audit Management System) project. It is built with Node.js, Express, and Sequelize ORM, providing RESTful APIs and real-time socket communication for the IAMS frontend.

## Features

- User authentication and role-based authorization (admin, auditor, auditee)
- Audit and checklist management
- Maintenance scheduling with cron jobs
- File uploads (images, Excel, PDF)
- Real-time notifications via Socket.io
- RESTful API endpoints for all resources
- Database migrations and seeders
- EJS views for server-side rendering (for testing/admin)

## Project Structure

```
Backend/
├── .env.example           # Example environment variables
├── index.js               # Entry point
├── src/
│   ├── server.js          # Express server setup
│   ├── socket.js          # Socket.io setup
│   ├── config/            # Configuration files (DB, view engine)
│   ├── controllers/       # API controllers
│   ├── cron/              # Scheduled jobs
│   ├── middleware/        # Express middlewares (auth, upload, etc.)
│   ├── migrations/        # Sequelize migrations
│   ├── models/            # Sequelize models
│   ├── public/            # Static files (uploads)
│   ├── routes/            # API routes
│   ├── seeders/           # Database seeders
│   ├── services/          # Business logic
│   └── views/             # EJS templates
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- MySQL or compatible database

### Installation

1. Clone the repository and navigate to the backend folder:

   ```sh
   git clone <repo-url>
   cd Backend
   ```

2. Install dependencies:

   ```sh
   npm install
   # or
   yarn install
   ```

3. Copy `.env.example` to `.env` and update environment variables as needed.

4. Run database migrations and seeders:

   ```sh
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. Start the server:

   ```sh
   npm start
   # or
   yarn start
   ```

## Scripts

- `npm start` — Start the server with nodemon and Babel
- `npx sequelize-cli db:migrate` — Run migrations
- `npx sequelize-cli db:seed:all` — Seed the database

## API Overview

API endpoints are defined in [`src/routes/web.js`](src/routes/web.js) and handled by controllers in [`src/controllers/`](src/controllers/).

- **User**: Login, logout, change password, get users by role, etc.
- **Area/Location/Type/Shift**: CRUD operations for each entity.
- **Checklist**: Upload and manage checklists (Excel files).
- **Audit**: Manage audits, launch requirements, update results.
- **Requirement**: Manage audit requirements, upload evidence (images/PDF).
- **Notifications**: Real-time notifications via Socket.io.

## File Uploads

- Images: `src/public/uploads/`
- Excel: `src/public/uploadsExcel/`
- PDF: `src/public/uploadsPDF/`

## Useful Notes

- Environment variables are managed in `.env` (see `.env.example` for template).
- CORS is enabled for frontend-backend communication.
- EJS views in `src/views/` are mainly for admin/testing purposes.
- For CORS errors, ensure `URL_REACT` in `.env` matches your frontend URL.

## License

This project is for internal use. Contact the project maintainers for more information.

```

```

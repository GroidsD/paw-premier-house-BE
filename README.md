# PET-SANCTUARY Backend

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
│   ├── AI/                # 🤖 AI Chatbot (NEW)
│   │   ├── classifyIntent.js      # Intent classification
│   │   ├── semanticSearch.js      # Semantic search with embeddings
│   │   ├── handleUserQuery.js     # Main query handler
│   │   ├── conversationMemory.js  # Conversation context manager
│   │   ├── recommendService.js    # Product recommendation
│   │   └── statsQueries.js        # Statistics queries
│   ├── config/            # Configuration files (DB, view engine, OpenAI)
│   ├── controllers/       # API controllers
│   ├── cron/              # Scheduled jobs
│   ├── middleware/        # Express middlewares (auth, upload, etc.)
│   ├── migrations/        # Sequelize migrations
│   ├── models/            # Sequelize models
│   ├── public/            # Static files (uploads)
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts (embedProducts.js)
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

---

## 🤖 AI Chatbot (NEW)

### Features

- **Intent Classification:** Hiểu 14+ loại câu hỏi (greeting, product search, price inquiry, recommendations, etc.)
- **Semantic Search:** Tìm kiếm sản phẩm bằng embeddings với OpenAI
- **Conversation Memory:** Nhớ context và lịch sử chat
- **Entity Extraction:** Tự động trích xuất category, pet_type, price_range
- **Smart Recommendations:** Gợi ý sản phẩm dựa trên user profile và lịch sử
- **Multi-language:** Hỗ trợ tiếng Việt và tiếng Anh

### Quick Start

```bash
# 1. Update Supabase schema
# Copy nội dung supabase_schema_update.sql vào Supabase SQL Editor và chạy

# 2. Re-embed products
node src/scripts/embedProducts.js

# 3. Test chatbot
# Gửi request đến API endpoint với câu hỏi
```

### Documentation

- **Quick Start:** [`QUICK_START.md`](QUICK_START.md) - Train AI trong 5 phút
- **Training Guide:** [`AI_TRAINING_GUIDE.md`](AI_TRAINING_GUIDE.md) - Hướng dẫn chi tiết
- **Upgrade Summary:** [`AI_UPGRADE_SUMMARY.md`](AI_UPGRADE_SUMMARY.md) - Tổng kết nâng cấp

### Requirements

- OpenAI API Key (for embeddings & GPT)
- Supabase account (for vector storage)
- Environment variables:
  ```
  OPENAI_API_KEY=sk-...
  SUPABASE_URL=https://...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

---

## Useful Notes

- Environment variables are managed in `.env` (see `.env.example` for template).
- CORS is enabled for frontend-backend communication.
- EJS views in `src/views/` are mainly for admin/testing purposes.
- For CORS errors, ensure `URL_REACT` in `.env` matches your frontend URL.

## License

This project is for internal use. Contact the project maintainers for more information.

```

```

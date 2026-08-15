# CertGuard — Digital Certificate Generation & Verification System

CertGuard is an enterprise-grade platform for event organizers and administrators to generate, issue, email, and cryptographically verify digital certificates in bulk.

## Key Features

- **Role-Based Access Control**:
  - **Admin**: Full control over users, events, templates, certificates, and audit logs.
  - **Organizer**: Create events, manage templates, issue single or bulk CSV certificates.
  - **Public**: Search & verify certificate authenticity via direct link or QR code scan without logging in.
- **Cryptographic Verification**:
  - Computes a deterministic **SHA-256 hash** for every certificate payload (`recipientName | eventName | issueDate | certCode`).
  - Validates data integrity on every verification attempt.
- **Dynamic PDF & QR Rendering**:
  - HTML/CSS canvas rendering to pixel-perfect PDF using **Puppeteer**.
  - High-resolution QR codes generated via `qrcode` package pointing directly to `/verify/{certCode}`.
- **Interactive Drag & Drop / Coordinate Template Editor**:
  - Visual workspace to position text placeholders (`recipientName`, `eventName`, `issueDate`, `certCode`, `authorityTitle`, `qrCode`) over uploaded background images.
- **Bulk CSV Issuance & Validation Preview**:
  - Parse CSV spreadsheets and preview recipient data before committing to bulk rendering and email dispatch.
- **Audit Trails & Analytics**:
  - Tracks every verification attempt with timestamp, IP address, user agent, and status check in `verification_logs`.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6
- **Backend**: Node.js, Express, REST API
- **Database**: PostgreSQL / SQLite (Prisma ORM)
- **PDF Engine**: Puppeteer
- **Security**: JWT Authentication, bcryptjs password hashing, express-rate-limit

---

## Setup & Running Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Ensure environment variables in `backend/.env` match your configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=certguard_super_secret_jwt_key_2026!@#
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db" # Or postgresql://user:pass@localhost:5432/certguard
FRONTEND_URL=http://localhost:5173
```

Run database migrations and seed default data:
```bash
# Push schema to database
npx prisma db push

# Seed sample admin, organizer, events & test certificates
npm run seed
```

Start backend development server:
```bash
npm run dev
```
The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Setup

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend web app will run on `http://localhost:5173`.

---

## Default Seed Credentials

- **Admin Account**: `admin@certguard.com` / `Admin@123`
- **Organizer Account**: `organizer@certguard.com` / `Organizer@123`
- **Sample Certificate Codes for Verification**:
  - `CERT-2026-ALEX99` (Valid)
  - `CERT-2026-SOPH01` (Valid)
  - `CERT-2026-MIKE88` (Revoked)

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | JWT |
| `GET` | `/api/events` | List events with filters | JWT |
| `POST` | `/api/events` | Create new event | JWT |
| `GET` | `/api/templates` | List design templates | JWT |
| `POST` | `/api/templates` | Upload background template image | JWT |
| `POST` | `/api/certificates/generate` | Issue single PDF & QR certificate | JWT |
| `POST` | `/api/certificates/bulk-generate` | Bulk issue certificates from CSV | JWT |
| `GET` | `/api/certificates` | Search & filter issued certificates | JWT |
| `PATCH` | `/api/certificates/:id/revoke` | Revoke a certificate | JWT |
| `POST` | `/api/certificates/:id/reissue` | Reissue certificate & regenerate PDF | JWT |
| `GET` | `/api/verify/:certCode` | Public certificate verification endpoint | Rate Limited |
| `GET` | `/api/logs` | Fetch verification audit history | JWT |
| `GET` | `/api/logs/analytics` | Fetch high-level metric analytics | JWT |

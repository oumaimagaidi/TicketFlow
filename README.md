# 🎟️ TicketFlow — Internal Ticketing System

A full-stack internal ticketing system built as part of the **AIESEC Full-Stack Task** for Madaar Solutions.  
This project includes user authentication, role-based access, ticket management, file uploads, search, filters, pagination, and real-time live chat integration.

---

## 📌 Task Overview

This system implements all required features from the task description:

- Authentication (login required)
- Role-based access (Admin / User)
- Ticket submission with file attachments
- Ticket list with filters, search, pagination
- Ticket details page
- Tawk.to live chat integration
- Django REST API
- React frontend (Option A)

---

# ⭐ Features Implemented

## 1️⃣ Authentication
- JWT-based authentication with Simple JWT  
- Login required for all actions  
- Admin access restricted to Admin role  
- Users can register, log in, and view only their tickets  

### User Roles

#### 👨‍💼 Admin
- View **all** tickets  
- Filter by category and status  
- Search by title or username  
- Pagination  
- Update ticket status  

#### 👤 User
- Create new tickets  
- View **only their own** tickets  
- Apply search and filters to their own items  

---

## 2️⃣ Ticket Management

Each ticket contains:

| Field       | Type                                    |
|-------------|------------------------------------------|
| id          | integer                                  |
| title       | string                                   |
| description | string                                   |
| category    | enum (Technical / Financial / Product)   |
| status      | enum (New / Under Review / Resolved)     |
| attachment  | file (optional)                          |
| createdBy   | user                                     |
| createdAt   | datetime                                 |

File upload is handled through **Cloudinary**.

---

## 3️⃣ User Ticket Submission Page

Users can:

- Enter a ticket title  
- Choose a category  
- Write a detailed description  
- Upload a file  
- Submit the ticket  

---

## 4️⃣ Ticket List (Frontend)

### Admin View
- View all tickets  
- Filter by **category**  
- Filter by **status**  
- Search by title or username  
- Pagination (client-side)  

### User View
- View only personal tickets  
- Apply the same filters & search  

---

## 5️⃣ Ticket Details Page

Includes:

- Ticket information  
- Status badge  
- Attachment preview (images / PDFs)  
- Admin can update ticket status  
- Optional: status history  

---

## 6️⃣ Real-Time Support Chat

Integrated with **Tawk.to** as required.

- Default widget (no custom UI)  
- Visible on all pages  
- Loads user info automatically  
- Fully functional live support chat  

Configuration (example):

s1.src = 'https://embed.tawk.to/YOUR_TAWKTO_ID/default';

🏗️ Tech Stack
Backend — Django

Django 4.2

Django REST Framework

Simple JWT

Cloudinary

SQLite for development

CORS Headers

Frontend — React (Option A)

React 18 + TypeScript

Vite

React Router

Axios

Tailwind CSS

shadcn/ui

date-fns

🎨 Design Template Origin
This project uses a custom-built UI template created specifically for the TicketFlow system.
Built from scratch (no external template used)

📁 Project Structure
TicketFlow/
├── Backend/
│   ├── backend/              
│   ├── tickets/              
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   ├── requirements.txt
│   └── manage.py
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md

🚀 Environment Setup Instructions
🔧 Backend Setup
git clone https://github.com/oumaimagaidi/TicketFlow
cd TicketFlow/Backend

Create virtual environment:
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # macOS/Linux

Install dependencies:
pip install -r requirements.txt
or Manually if you want

Create .env:
cp .env.example .env
CORS_ALLOWED_ORIGINS=//
CLOUDINARY_CLOUD_NAME=//
CLOUDINARY_API_KEY=//
CLOUDINARY_API_SECRET=//
DEBUG=True

Run migrations:
python manage.py makemigrations
python manage.py migrate

Create admin user:
python manage.py createsuperuser

Run backend:
python manage.py runserver

Backend runs at: http://localhost:8000

💻 Frontend Setup
cd ../Frontend
npm install
npm run dev

Frontend runs at: http://localhost:8081

🔌 API Endpoints
Authentication
| Method | Endpoint            | Description   |
| ------ | ------------------- | ------------- |
| POST   | /api/auth/login/    | Login         |
| POST   | /api/auth/register/ | Register      |
| GET    | /api/auth/users/me/ | Get user info |

Tickets
| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| GET    | /api/tickets/                   | List tickets (role-based)  |
| POST   | /api/tickets/                   | Create ticket              |
| GET    | /api/tickets/:id                | Ticket details             |
| PATCH  | /api/tickets/:id/update_status/ | Update status (Admin only) |

📦 File Upload (Cloudinary)
Supports images, PDFs, documents

Max size: 10 MB

Automatic preview on frontend

Secure upload handling

🧪 How to Test the APIs

Run backend

Use Postman or Thunder Client

Log in → copy token
1️⃣ Login Example
POST http://localhost:8000/api/auth/login/
Body Example:

{
    "email": "nouveau@test.com",
    "password": "Nouveau123!@#"
}
2️⃣ Register Example

Endpoint:
POST http://localhost:8000/api/auth/register/

Body Example:
{
    "email": "nouveau@test.com",
    "username": "nouveauuser",
    "password": "Nouveau123!@#",
    "password2": "Nouveau123!@#"
}

4️⃣ List Tickets

Endpoint:
GET http://localhost:8000/api/tickets/
Admin → sees all tickets

User → sees only their tickets

💬 How to Test Chat Integration

Go to Tawk.to

Create a Property

Copy your widget ID

Replace it inside TawkToChat.tsx

Run the frontend

Chat widget appears automatically

Test protected routes with Authorization: Bearer <token>


🧩 Evaluation Criteria

✔ Clean API architecture
✔ Correct role-based access
✔ Search, filters, pagination
✔ Functional ticket creation
✔ Proper live chat integration
✔ Clean UI & custom template
✔ Clear documentation


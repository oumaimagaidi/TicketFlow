# TicketFlow - Internal Ticketing System

## 📋 Overview
A full-stack internal ticketing system built with Django REST Framework backend and React frontend. The system allows employees to submit support tickets with file attachments, and admins to manage and track ticket statuses.

## 🎯 Features
- **Authentication**: JWT-based user authentication
- **Role-based Access**: Admin/User roles with different permissions
- **Ticket Management**: Create, view, update, and delete tickets
- **File Attachments**: Upload files to tickets using Cloudinary
- **Real-time Chat**: Integrated Tawk.to live chat support
- **Responsive UI**: Modern interface with Tailwind CSS
- **Search & Filters**: Advanced filtering and search functionality
- **Pagination**: Client-side pagination for ticket lists

## 🏗️ Tech Stack

### Backend
- **Django 4.2+** - Python web framework
- **Django REST Framework** - API development
- **Django REST Simple JWT** - JSON Web Token authentication
- **Cloudinary** - File storage for attachments
- **PostgreSQL** - Database (SQLite for development)
- **CORS Headers** - Cross-origin resource sharing

### Frontend
- **React 18** - Frontend library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **Axios** - HTTP client
- **date-fns** - Date formatting

## 📁 Project Structure
TicketFlow/
├── Backend/ # Django backend
│ ├── backend/ # Django project settings
│ ├── tickets/ # Main app
│ │ ├── models.py # Database models
│ │ ├── views.py # API views
│ │ ├── serializers.py # Data serializers
│ │ ├── urls.py # URL routing
│ │ └── permissions.py # Custom permissions
│ ├── requirements.txt # Python dependencies
│ └── manage.py # Django CLI
│
├── Frontend/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ ├── contexts/ # React contexts
│ │ ├── hooks/ # Custom hooks
│ │ ├── pages/ # Page components
│ │ ├── types/ # TypeScript types
│ │ └── utils/ # Utility functions
│ ├── index.html # Main HTML
│ ├── package.json # Node dependencies
│ └── vite.config.ts # Vite configuration
│
└── README.md # This file

## 🚀 Quick Start

### Prerequisites
- Python 3.14.0
- Node.js 16+
-  SQLite for dev
- Cloudinary account (for file storage)
- Tawk.to account (for live chat)

### 1. Backend Setup

```bash
# Clone the repository
git clone (https://github.com/oumaimagaidi/TicketFlow)
cd TicketFlow/Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
or Manually: 


# Set up environment variables
cp .env.example .env
# Edit .env with your configuration:
# - SECRET_KEY
# - DATABASE_URL
# - CLOUDINARY_URL
# - DEBUG=True

# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser


# Run development server
python manage.py runserver

Backend will be running at: http://localhost:8000
2. Frontend Setup
bash
# Navigate to frontend directory
cd ../Frontend

# Install dependencies
npm install

# Run development server
npm run dev
Frontend will be running at: http://localhost:8081
👤 User Roles
Admin Users
View ALL tickets from all users

Update ticket status (New → Under Review → Resolved)

Filter, search, and paginate through tickets

Access to all features
Regular Users
Create new support tickets

View ONLY their own tickets

Upload attachments to tickets

Filter and search their own tickets
🎫 Ticket System
/////
File Upload
Uses Cloudinary for file storage
Supports: Images (PNG, JPG, GIF), PDFs, Documents (DOC, DOCX), Spreadsheets (XLS, XLSX)
Max file size: 10MB
Automatic file type detection and preview

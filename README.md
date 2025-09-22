



# Project Architecture Overview <img src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" width="30"/>


## Frontend Components 
<marquee>⚡ 🖥️ 📱 🎨 🚀</marquee>


The frontend is built with Next.js 14 and React 18, using modern UI libraries for a responsive and dynamic user experience.

### Frontend Structure
app/                # Next.js App Router pages (React components)
  page.jsx          # Landing page
  dashboard/page.jsx # Dashboard interface
  complaints/page.jsx # Complaints listing
  login/page.jsx     # Login page
  register/page.jsx  # Registration page
  profile/page.jsx   # User profile
  settings/page.jsx  # Settings page
  trend/page.jsx     # Analytics/trends page

### Frontend Technologies
- Next.js 14 App Router with React 18
- Tailwind CSS for modern, responsive styling
- Radix UI for accessible UI components
- Lucide React for icons
- Recharts for data visualization
- React Hook Form for form management and validation

### Frontend Features
- Fully responsive design with modern UI components
- Client-side routing and smooth navigation
- Form handling and validation
- Data visualization through charts and graphs
- Authentication UI (login, register, and session management)

---

## Backend Components

The backend is powered by Next.js API Routes, handling authentication, database operations, and AI-powered complaint classification.

### Backend Structure
app/api/             # Next.js API routes (server-side endpoints)
  auth/              # Authentication (login, logout, register, user info)
  complaints/        # Complaint CRUD operations
  categories/        # Category management
  classify/          # AI-powered complaint classification

### Backend Technologies
- Next.js API Routes for building server-side RESTful endpoints
- SQLite3 with Better SQLite3 for fast, lightweight database access
- JWT authentication using the jose library
- AI SDK for automated complaint classification
- Multi-database support: SQLite, MySQL, and SQL Server

### Backend Features
- RESTful API endpoints for data handling
- Authentication and session management
- CRUD operations for database entities
- AI-powered complaint classification
- File upload handling
- Data validation

---

## Architecture Summary

This is a full-stack Next.js application with the following key layers:

Component         | Description
------------------|-------------------------------------------------------------
Frontend          | React components inside the `app/` directory (client-side)
Backend           | API routes in the `app/api/` directory (server-side)
Database          | SQLite by default, with support for MySQL and SQL Server
Authentication    | JWT-based authentication with session management
AI Integration    | AI-powered automated complaint classification
Deployment        | Optimized for deployment on Vercel with analytics

---

## Deployment

The project is ready for Vercel deployment and includes configurations for seamless analytics integration and production readiness.


Barangay Complaint Management

> - npm install

> - npm run dev

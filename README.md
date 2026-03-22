# Full-Stack-Appliction-Development-
>>>>>>> c24526dd6cd3084f1ed85881ba736a2c3316439a
=======
# 🎓 Vel Tech University - Campus Event & Registration Portal

A full-stack web application for managing campus events, student registrations, and admin oversight at Vel Tech University.

## 🚀 Features

### Student Portal
- ✅ Register a new account with student details (name, email, department, student ID, phone)
- ✅ Login/Logout securely
- ✅ Browse all campus events with images and category filters
- ✅ View event details with seat availability progress bars
- ✅ Register for events with one click
- ✅ Personal dashboard showing all registered events
- ✅ Cancel event registrations

### Admin Portal
- ✅ Secure admin login (separate from student login)
- ✅ Dashboard with live stats (events, students, registrations)
- ✅ Add new events with images (URL or file upload)
- ✅ Manage/delete events
- ✅ View all registrations with student details
- ✅ View all registered students
- ✅ Remove individual registrations

### Pre-loaded Events (8 events)
1. National Technology Summit 2025
2. Inter-College Coding Hackathon
3. Cultural Fiesta - Velocity 2025
4. Research Paper Presentation
5. Sports Championship - Techathlon
6. Industry Expert Workshop - AI & ML
7. Entrepreneurship Bootcamp
8. Annual Science Exhibition

---

## 📋 Requirements
- Node.js (v14+)
- MySQL (v8.0+)

## ⚙️ Setup Instructions

### 1. MySQL Setup
```sql
-- Login to MySQL
mysql -u root -p

-- Create the database
CREATE DATABASE campus_event_portal;
exit
```

### 2. Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your MySQL credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_event_portal
SESSION_SECRET=veltech_secret_2025
PORT=3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Application
```bash
npm start
```
The app will:
- Auto-create all database tables
- Seed 8 sample events with images
- Create default admin account

### 5. Access the Application
| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Student Register | http://localhost:3000/register |
| Student Login | http://localhost:3000/login |
| All Events | http://localhost:3000/events |
| My Dashboard | http://localhost:3000/dashboard |
| Admin Login | http://localhost:3000/admin/login |
| Admin Panel | http://localhost:3000/admin |

---

## 🔐 Default Admin Credentials
```
Username: veltech_admin
Password: admin@veltech123
```

## 📁 Project Structure
```
veltech-portal/
├── server.js           # Main Express server + all API routes
├── config/
│   └── db.js          # MySQL connection pool
├── public/
│   ├── css/
│   │   └── style.css  # All styles
│   ├── index.html     # Homepage
│   ├── events.html    # Events listing
│   ├── event-detail.html  # Single event + register
│   ├── register.html  # Student signup
│   ├── login.html     # Student login
│   ├── dashboard.html # Student dashboard
│   ├── admin-login.html  # Admin login
│   ├── admin.html     # Admin panel
│   └── admin-add-event.html  # Add new event
├── uploads/           # Uploaded event images (auto-created)
├── database.sql       # Reference SQL schema
├── .env.example       # Environment variable template
└── package.json
```

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/events | Get all events |
| GET | /api/events/:id | Get single event |
| POST | /api/user/register | Student registration |
| POST | /api/user/login | Student login |
| POST | /api/user/logout | Student logout |
| POST | /api/register-event | Register for an event |
| GET | /api/my-registrations | Get student's registrations |
| DELETE | /api/cancel-registration/:id | Cancel a registration |
| POST | /api/admin/login | Admin login |
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/registrations | All registrations |
| GET | /api/admin/users | All students |
| POST | /api/admin/events | Create new event |
| DELETE | /api/admin/events/:id | Delete event |

---

## 🎨 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Fetch API)
- **Backend**: Node.js + Express.js
- **Database**: MySQL with mysql2
- **Auth**: bcryptjs + express-session
- **File Upload**: Multer

---

Built for Vel Tech University — Avadi-Tiruvallur High Road, Chennai, Tamil Nadu

Full-Stack Application Development Project
=======
# Full-Stack-Appliction-Development-
>>>>>>> c24526dd6cd3084f1ed85881ba736a2c3316439a

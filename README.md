# Rolewise - Student Placement OS

A full-stack student placement application with React frontend and Flask backend.

## Project Structure

```
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Python Flask API
│   └── venv/          # Python virtual environment
├── docker-compose.yml # Docker orchestration
└── README.md
```

## Tech Stack

- **Frontend:** React, Tailwind CSS, Zustand, Axios, Vite
- **Backend:** Python, Flask, Flask-JWT-Extended, SQLAlchemy
- **Database:** PostgreSQL (users, jobs, applications), MongoDB (community messages)
- **Containerization:** Docker + Docker Compose

## Quick Start with Docker

```bash
docker-compose up --build
```

This starts:
- Frontend at http://localhost:80
- Backend API at http://localhost:5000
- PostgreSQL at localhost:5432
- MongoDB at localhost:27017

## Local Development

### Backend

```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Run the server
python run.py
```

The backend runs on http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000 and proxies API calls to the backend.

## Demo Credentials

- Email: `student@college.edu`
- Password: `password123`

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/resume` - Upload resume

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/search?q=` - Search jobs
- `GET /api/jobs/filter` - Filter jobs
- `GET /api/jobs/deadlines` - Get deadlines
- `POST /api/jobs/:id/bookmark` - Bookmark job
- `DELETE /api/jobs/:id/bookmark` - Remove bookmark
- `GET /api/jobs/bookmarks` - Get bookmarks

### Applications
- `POST /api/applications/apply/:jobId` - Apply
- `GET /api/applications` - List applications
- `GET /api/applications/:jobId` - Get status
- `DELETE /api/applications/:jobId` - Withdraw

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark read
- `GET /api/notifications/preferences` - Get prefs
- `PUT /api/notifications/preferences` - Update prefs

### Resume
- `POST /api/resume/parse` - Parse resume
- `GET /api/resume/match/:jobId` - Skill matching

### Community
- `GET /api/community/messages` - Get messages
- `POST /api/community/messages` - Post message
- `DELETE /api/community/messages/:id` - Delete
- `POST /api/community/messages/:id/reply` - Reply

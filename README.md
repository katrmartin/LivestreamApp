# 📺 StampedeStream

StampedeStream is a full-stack livestreaming web application designed for live sports events. It features a real-time scoreboard, embedded YouTube Live video stream, and interactive live chat — all built with modern web technologies.

---

## 🚀 What Can It Do?

- 🔐 Secure login system with Google OAuth and email/password options (Supabase Auth)
- 🧑‍💼 Admin panel for:
  - Scheduling livestreams
  - Updating live scores
  - Setting team names
- 📺 Stream page with:
  - Embedded YouTube Live player
  - Real-time score updates via WebSockets
  - Live audience chat feature

---

## 🧑‍💻 Tech Stack

- **Frontend**: React
- **Backend**: FastAPI, Python
- **Database & Auth**: Supabase (PostgreSQL + Auth + Realtime)

---

## ⚙️ Developer Setup Instructions

### 🧩 Prerequisites

- Node.js + npm
- Python 3.9+
- PostgreSQL (managed by Supabase)
- Supabase project with API keys and RLS enabled
- YouTube Live account (optional for streaming)

---

### Clone the Repo

 - git clone git@github.com:berenicerascon/LivestreamApp.git
 - cd LiveStreamApp

### Frontend Setup

 - ./run-frontend.sh

### Backend Setup

 - ./run-backend2.sh

### .env templates

 - backend:
   - SUPABASE_URL=your-supabase-url
   - SUPABASE_KEY=your-service-role-key
   - JWT_SECRET=your-jwt-secret


 - frontend:
   - REACT_APP_SUPABASE_URL=your-supabase-url
   - REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   - REACT_APP_BACKEND_URL=http://localhost:8000 

---

### 🙌 Team

 - Built by CMU students Katie Martin, Berenice Rascon, and Carlos Ortiz for the Spring 2025 Software Engineering course.

 ### Contributions:
  - Carlos:
    - User login system 
    - User Authentication and Authorization
    - Websocket Logic
    - Database creation
    - Testing

  - Berenice:
    - Contract 
    - UI Design
    - UX Development 
    - Tutorial Documentation

  - Katie:
    - Project manager
    - Backend development
    - Admin dashboard 
    - YouTube integration
    - Broadcast/streaming setup
    - Deployment
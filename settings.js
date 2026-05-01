# 🚐 Mobile Ads Van — Full Stack Website

Kolkata's mobile van advertising startup website with admin dashboard.

---

## 📁 Folder Structure

```
mobileadsvan/
├── frontend/           ← Public website (HTML/CSS/JS)
│   └── index.html      ← Main website (use mobileadvertising.html)
│
├── admin/              ← Admin dashboard
│   ├── index.html
│   ├── css/admin.css
│   └── js/admin.js
│
└── backend/            ← Node.js API server
    ├── server.js        ← Entry point
    ├── database.js      ← DB schema (lowdb JSON)
    ├── db.json          ← Auto-created database file
    ├── .env             ← Config (edit this!)
    ├── middleware/
    │   ├── auth.js      ← JWT authentication
    │   └── upload.js    ← Multer file uploads
    ├── routes/
    │   ├── auth.js      ← Login / verify / change-password
    │   ├── enquiries.js ← Contact form leads
    │   ├── media.js     ← Image/video upload
    │   └── settings.js  ← Site settings & packages
    └── uploads/
        ├── images/      ← Uploaded images stored here
        └── videos/      ← Uploaded videos stored here
```

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd backend
node server.js
```

Server runs at: **http://localhost:5000**

### 2. Open the Website

Open `frontend/index.html` in browser, OR visit **http://localhost:5000**

### 3. Open Admin Dashboard

Visit: **http://localhost:5000/admin**

**Default login:**
- Username: `mobileadsvan`
- Password: `admin@2025`

> ⚠️ Change these in `.env` before going live!

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login → returns JWT token |
| GET  | `/api/auth/verify` | Verify token |
| PUT  | `/api/auth/change-password` | Change password |

### Enquiries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enquiries` | Submit contact form (public) |
| GET  | `/api/enquiries` | Get all enquiries (admin) |
| GET  | `/api/enquiries/:id` | Get single enquiry (admin) |
| PUT  | `/api/enquiries/:id` | Update status/notes (admin) |
| DELETE | `/api/enquiries/:id` | Delete enquiry (admin) |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/media/upload` | Upload images/videos (admin) |
| GET  | `/api/media` | List all media (public) |
| PUT  | `/api/media/:id` | Update caption/category (admin) |
| DELETE | `/api/media/:id` | Delete file (admin) |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get site settings (public) |
| PUT | `/api/settings` | Update settings (admin) |
| GET | `/api/packages` | Get packages (public) |
| GET | `/api/dashboard/stats` | Dashboard stats (admin) |

---

## ⚙️ Configuration (.env)

```env
PORT=5000
JWT_SECRET=change_this_secret
ADMIN_USERNAME=mobileadsvan
ADMIN_PASSWORD=admin@2025
ADMIN_EMAIL=soumomazumdar292@gmail.com
MAX_FILE_SIZE_MB=20
```

---

## 📦 Database Schema

**admins** — Admin users with bcrypt-hashed passwords
**enquiries** — Contact form leads with status tracking
**media** — Uploaded images and videos metadata
**packages** — Campaign packages (Basic/Standard/Premium)
**settings** — Site-wide config (price, contact info, stats)

---

## 🌐 Deployment

For production hosting:
1. Deploy backend to **Railway / Render / VPS**
2. Update CORS origins in `server.js`
3. Change `.env` credentials
4. Host frontend on **Netlify / Vercel / cPanel**

---

**Built for Mobile Ads Van, Kolkata · 2025**

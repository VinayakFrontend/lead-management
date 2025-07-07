
# 📈 Lead Management System - MERN Stack

A full-featured Lead Management System built with the MERN stack (MongoDB, Express, React, Node.js). Includes role-based access control, lead tracking, assignment, analytics, tagging, comments, and Excel import/export.

---

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)
- **Backend (Render)**: [https://your-backend.onrender.com](https://your-backend.onrender.com)

---

## 📚 Features

### ✅ Authentication & Authorization
- JWT-based auth
- Role-based access: `super-admin`, `sub-admin`, `support-agent`

### ✅ Lead Management
- Create, update, delete leads
- Assign leads to agents
- Filter leads by status, date, tags, etc.
- View detailed lead info
- Commenting on leads

### ✅ User Management (Admin Only)
- Create, update, delete users
- View user activity logs

### ✅ Analytics Dashboard
- Lead status distribution (Pie Chart)
- Agent performance (Bar Chart)
- Recent activity log

### ✅ Excel Integration
- Import leads from `.xlsx` file
- Export filtered leads to Excel

---

## 🏗️ Tech Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| React.js (Vite) | Node.js, Express | MongoDB (Atlas) |
| Chart.js | JWT Auth | Mongoose ODM |

---

## 🔑 Roles & Access

| Role         | Access                                                                 |
|--------------|------------------------------------------------------------------------|
| Super Admin  | All permissions: users, leads, analytics                               |
| Sub Admin    | Manage leads, assign to agents, view analytics                         |
| Support Agent| View/edit only their assigned leads; cannot delete, assign or manage users |

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lead-management-system.git
cd lead-management-system
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Run the server:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Update the API base URL in your `axios` calls (e.g. `http://localhost:5000` or Render URL)

Run React dev server:

```bash
npm run dev
```

---

## 🌍 Deployment

### Backend: [Render](https://render.com)
- Deploy backend as a Web Service
- Set environment variables

### Frontend: [Vercel](https://vercel.com)
- Deploy frontend from GitHub repo
- Update API base URLs accordingly

---

## 📁 Project Structure

```
lead-management-system/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── css/
│   │   └── App.jsx
│   └── vite.config.js
```

---

## ✍️ Developer

- **Name:** Vinayak Gupta
- **Role:** MERN Stack Developer Intern
- **Company:** Ideamagix

---

## 📬 Contact

For any queries or collaboration, reach out at:

📧 vinayak@example.com  
📞 +91-XXXXXXXXXX

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 📸 Screenshots

> You can add UI screenshots here if needed.

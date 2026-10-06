# 🐾 Michiato

Management system designed for a pet-friendly restaurant and coffee shop. It enables customers to browse the digital menu (including special options for pets) and manage orders, while providing dedicated administration modules for table host management and kitchen order fulfillment.

---

## 🚀 Key Features

- **Digital Menu & Catalog:** Interactive view of general dishes and a specialized pet menu (`/menu-pets`).
- **Cart & Order Flow:** Real-time shopping and table-based ordering workflow with client-side state persistence.
- **Role-Based Access Control (RBAC):**
  - **Customer (`cliente`):** Menu browsing, user profile access, and order placement.
  - **Hostess (`host`):** Dedicated module for real-time table assignment and dining room status (`/hostes`).
  - **Administrator (`admin`):** Monitoring, status updates, and dispatching of kitchen orders (`/pedidos`).
- **Frontend Security:** Protected routes using higher-order components (`ProtectedRoute`) combined with active session and role verification.

---

## 🛠️️ Tech Stack

- **Frontend:** React.js, React Router DOM, Context API, CSS3.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL.
- **Tooling & Version Control:** Git, GitHub, npm.

---

## 📂 Project Structure

```plaintext
michiato/
├── backend/
│   ├── config/         # MySQL database connection setup
│   ├── controllers/    # Route controllers (auth, orders, tables)
│   ├── middlewares/    # JWT and RBAC verification logic
│   ├── routes/         # API endpoints (/api/login, /api/pedidos, etc.)
│   └── index.js        # Express server entry point
│
└── frontend/
    ├── public/
    └── src/
        ├── componentes/ # Reusable UI items (NavBar, Footer, ProtectedRoute, etc.)
        ├── context/     # Global state providers (AuthContext, CartContext)
        ├── paginas/     # Views (Home, Menu, Hostes, Pedidos, LogIn, SingIn, etc.)
        ├── App.js       # App router and context providers configuration
        └── index.js     # React root mount
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- Node.js (version 18+ recommended)
- MySQL Database Engine (e.g., XAMPP, MySQL Workbench, or CLI)

### 1. Clone the repository
```bash
git clone https://github.com/tu-usuario/michiato.git
cd michiato
```

### 2. Configure the Database
Import the included `.sql` database schema dump into your MySQL server (XAMPP recommended).

The database dump includes two default accounts for testing administrative modules:
- **Hostess access (`/hostes`):**  
  - Email: `hostes@gmail.com`  
  - Password: `Hostes.`
- **Admin access (`/pedidos`):**  
  - Email: `admin@gmail.com`  
  - Password: `Admin98.`

---

### 3. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
cd mi-backend
npm install
```

Create a `.env` file in the backend root directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=restaurante
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm run dev
# or: node index.js
```

---

### 4. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd michiato
npm install
```

Create a `.env` file in the root of the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start the React development server:
```bash
npm start
```

The application will run locally at `http://localhost:3000`.

---

## 👥 Testing Accounts & Role Management

To test role-based route guards and permissions:
1. Register a standard user from `/signup` (assigned the `cliente` role by default).
2. To test protected modules with a custom account, update the role directly in MySQL:
   ```sql
   UPDATE usuarios SET rol = 'host' WHERE email = 'your_email@example.com';  -- Grants access to /hostes
   UPDATE usuarios SET rol = 'admin' WHERE email = 'your_email@example.com'; -- Grants access to /pedidos
   ```
3. Log out and log back in to refresh the active session permissions.

---

## 📄 License

This project was developed for educational and portfolio demonstration purposes.

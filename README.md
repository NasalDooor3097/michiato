# 🐾 Michiato

Full-stack management system for a pet-friendly restaurant and coffee shop. It enables customers to browse the digital menu (including dedicated pet options) and place orders, while providing independent administrative modules for hosts (table management) and kitchen/staff (order tracking and fulfillment).

---

## 🚀 Key Features

- **Digital Menu & Catalog:** Interactive view for food and beverage items, featuring an exclusive pet menu (`/menu-pets`).
- **Cart & Order Management:** Client-side order tracking and table-assigned cart persistence.
- **Role-Based Access Control (RBAC):**
  - **Customer (`cliente`):** Menu browsing, user profile management, and order placement.
  - **Hostess (`host`):** Dedicated module for real-time table allocation and floor management (`/hostes`).
  - **Administrator (`admin`):** Order tracking, status updates, and kitchen dispatch control (`/pedidos`).
- **Frontend Route Protection:** Route authorization using higher-order components (`ProtectedRoute`), validating user sessions and role permissions.

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
│   ├── config/         # MySQL database connection & configuration
│   ├── controllers/    # Controller logic (auth, orders, tables)
│   ├── middlewares/    # JWT verification and role authorization
│   ├── routes/         # API endpoints (/api/login, /api/pedidos, etc.)
│   └── index.js        # Express application entry point
│
└── frontend/
    ├── public/
    └── src/
        ├── componentes/ # Reusable UI components (NavBar, Footer, ProtectedRoute, etc.)
        ├── context/     # AuthContext, CartContext
        ├── paginas/     # Page views (Home, Menu, Hostes, Pedidos, LogIn, SingIn, etc.)
        ├── App.js       # Route declarations and context providers
        └── index.js
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MySQL Server (XAMPP, MySQL Workbench, or CLI)

### 1. Clone the Repository
```bash
git clone https://github.com/tu-usuario/michiato.git
cd michiato
```

### 2. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin via XAMPP).
2. Ensure the `restaurante` database exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS `restaurante` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE `restaurante`;
   ```
3. Import the provided `.sql` schema file into the `restaurante` database.

---

### 3. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
cd mi-backend
npm install
```

Create a `.env` file in the backend root directory:
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

The client will run locally at `http://localhost:3000`.

---

## 👥 Creating Administrative Accounts (Roles Setup)

To test the role-protected modules without hardcoded credentials, use the registration interface and assign permissions in MySQL:

1. **Register User Accounts:**
   - Go to `http://localhost:3000/signup`.
   - Register the accounts you wish to use (e.g., one for hostess and one for orders/admin).
   - By default, all registered users receive the `cliente` role, and their passwords will be securely hashed with `bcrypt`.

2. **Grant Administrative Roles:**
   - Open your MySQL console or phpMyAdmin and execute:
   ```sql
   -- Assign the Hostess role (Grants access to /hostes)
   UPDATE usuarios SET rol = 'host' WHERE email = 'your_host_email@example.com';

   -- Assign the Administrator role (Grants access to /pedidos)
   UPDATE usuarios SET rol = 'admin' WHERE email = 'your_admin_email@example.com';
   ```

3. **Log In:**
   - Log in with the updated accounts at `/login` to access `/hostes` or `/pedidos`.

---

## 📄 License

This project was developed for educational and software engineering portfolio purposes.

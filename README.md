# Dayflow HRMS

Dayflow is a comprehensive Human Resource Management System (HRMS) designed for modern enterprises. It features role-based access control (RBAC) related to Employee Management, Attendance, Leave, and Payroll.

## Features

### Authentication & Authorization
- **Role-Based Access**: Admin and Employee roles with distinct dashboards.
- **Secure Auth**: JWT-based authentication with bcrypt password hashing.
- **Password Recovery**: Secure "Forgot Password" flow with email reset links.

### Admin Features
- **Dashboard**: Overview of total employees, attendance stats, and quick actions.
- **Employee Management**: Add view, and manage employees.
- **Attendance Monitoring**: View daily and historical attendance reports.
- **Leave Management**: Approve or reject leave requests.
- **Payroll**: Generate monthly payslips for employees.

### Employee Features
- **Dashboard**: Personal stats, daily check-in status, and quick links.
- **Attendance**: Check-in/Check-out with one click. View personal history.
- **Leave**: Apply for leave (Sick, Paid, Unpaid) with date validation and conflict checking.
- **Payslips**: View and download monthly salary slips.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons), Axios
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase) via Prisma ORM

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd DayFlow
    ```

2.  **Backend Setup**
    ```bash
    cd server
    npm install
    
    # Create .env file
    # PORT=5000
    # DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true&connection_limit=1"
    # DIRECT_URL="postgresql://user:password@host:5432/dbname"
    # JWT_SECRET=your_secret_key
    # EMAIL_HOST=smtp.gmail.com (Optional for Forgot Password)
    # EMAIL_PORT=587
    # EMAIL_USER=your_email@gmail.com
    # EMAIL_PASS=your_app_password
    
    # Push database schema to Supabase
    npx prisma db push

    # Seed Database (Admin: admin@dayflow.com / admin123)
    npm run seed
    
    # Start Server
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd client
    npm install
    
    # Start Frontend
    npm run dev
    ```

4.  **Access Application**
    - Open `http://localhost:5173`
    - Login with Admin credentials to start managing.

## License
MIT

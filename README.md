# HomeServe

HomeServe is a user-centric web platform designed to bridge the gap between service providers and service takers in urban areas. Inspired by popular on-demand service apps, it enables individuals to connect, manage, and utilize various services with ease.

---

## Features

### For Service Providers:
- **Manage Services**: Add, edit, or delete services based on city and category.
- **Pricing Control**: Set competitive prices for services.
- **Current Jobs**: Track ongoing bookings and mark them as completed.
- **Completed Jobs**: View and manage service history and performance.

### For Service Takers:
- **Service Discovery**: Browse and compare services by city, reviews, and pricing.
- **Past Jobs**: Access a record of previous bookings for future reference.

### Shared Features:
- **About Us**: Learn about the platform’s mission and vision.
- **Contact**: Access essential support information.
- **Services Page**: View available or provided services based on user type.

### Future Enhancements:
- Real-time communication tools.
- Integrated payment systems.

---

## Technology Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Environment Variables**: Managed using `.env` file

---

## Installation and Setup

Follow these steps to clone and run the project on your local machine:

### Prerequisites:
- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/) (v12 or later)
- [Git](https://git-scm.com/)

### Steps to Clone and Run:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/its-AkshatJain/HomeServe-App.git
   cd homeserve
   ```

2. **Set Up Backend**:
   - Navigate to the `server` directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `server` directory with the following content:
     ```env
     JWT_SECRET="your_jwt_secret"
     CLIENT_URL="http://localhost:5173"
     DB_USER="your_postgres_user"
     DB_HOST="localhost"
     DB_NAME="Homeserve"
     DB_PASSWORD="your_postgres_password"
     DB_PORT="5432"
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Set Up Frontend**:
   - Navigate to the `client` directory:
     ```bash
     cd ../client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm run dev
     ```

4. **Database Setup**:
   - Open PostgreSQL and create the `Homeserve` database:
     ```sql
     CREATE DATABASE Homeserve;
     ```
   - Run the `model.sql` file in PgAdmin.

---

## Scripts

### Backend (from `server` directory):
- `npm start`: Starts the backend server.
- `npm run dev`: Starts the server in development mode.

### Frontend (from `client` directory):
- `npm run dev`: Starts the React development server.
- `npm run build`: Builds the project for production.

---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

Thank you for using HomeServe!


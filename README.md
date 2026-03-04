# ARSII App

## Overview

The **ARSII App** is a prototype mobile application built for **ARSII-Sfax** to centralize team operations and project management. The current workflow relies on scattered tools (spreadsheets, messaging apps), causing miscommunication, missed deadlines, and lack of visibility.

This MVP aims to create a unified mobile platform that provides clarity on:

* **Who is doing what**
* **By when**
* **With what progress**

The MVP implements the first core features required to solve ARSII-Sfax's immediate coordination challenges.

---

## Core Features (MVP Completed)

###  1. Role-Based Architecture

* Four roles implemented: **Admin, Manager, Team Lead, User**.
* Interface and permissions change based on role.
* Examples:

  * **User** sees only their tasks.
  * **Manager** can view projects, teams, and assignments.
  * **Admin** can visualize team hierarchy.

###  2. Project & Task Lifecycle

* Managers/Leads can:

  * Create projects
  * Break projects into tasks
  * Assign tasks to specific users
  * Set deadlines
* Users can update task status: **To Do → In Progress → Done**.

### 3. Team Visualization

* Admin can view team structure:

  * Team members
  * Team Lead
  * Role associations

> Note: The remaining challenge requirements (Dashboard, Notifications, Collaboration, Realtime updates, Workload View, etc.) are not yet implemented.

---

## Project Structure

```
ARSII-App/
│
├── client/                     # Front-End (Expo React Native)
│   ├── app/
│   │   ├── admin/
│   │   │   ├── _layout.jsx
│   │   │   ├── create-user.jsx
│   │   │   ├── menu.jsx
│   │   │   └── teams.jsx
│   │   ├── auth/
│   │   │   ├── _layout.jsx
│   │   │   ├── index.jsx
│   │   │   └── login.jsx
│   │   ├── lead/
│   │   ├── manager/
│   │   │   ├── _layout.jsx
│   │   │   ├── create-project.jsx
│   │   │   ├── edit-project.jsx
│   │   │   ├── manager-accueil.jsx
│   │   │   └── project-details.jsx
│   │   ├── user/
│   │   │   └── _layout.jsx
│   │   └── App.js
│   ├── assets/
│   ├── node_modules/
│   ├── app.json
│   └── .env
│
└── server/                     # Back-End (Node.js + Prisma)
    ├── prisma/
    │   ├── migrations/
    │   └── schema.prisma
    ├── src/
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── projectController.js
    │   │   ├── taskController.js
    │   │   ├── teamController.js
    │   │   └── userController.js
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── projectRoutes.js
    │   │   ├── taskRoutes.js
    │   │   ├── teamRoutes.js
    │   │   └── userRoutes.js
    │   └── server.js
    ├── package.json
    ├── package-lock.json
    └── .env
```

---

## Technologies Used

### Front-End

* **React Native (Expo)**
* React Navigation
* Context API or Redux (depending on your implementation)
* Fetch/Axios for API calls

### Back-End

* **Node.js + Express**
* MongoDB or SQL (depending on your setup)
* JWT Authentication

---

## Prerequisites

Before running the project, ensure you have installed:

* **Node.js & npm**
* **Expo CLI**

  ```bash
  npm install -g expo-cli
  ```
* A mobile device with Expo Go or an emulator installed

Backend dependencies will be installed automatically via npm.

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd ARSII-App
```

---

### 2. Install Dependencies

#### Front-End

```bash
cd frontend
npm install
```

#### Back-End

```bash
cd backend
npm install
```

---

## Running the Application

###  Front-End (Expo)

To start the mobile app:

```bash
cd frontend
npx expo start
```

This will open Expo DevTools. You can run the app on:

* A physical device (QR code)
* Android emulator
* iOS simulator (macOS only)

###  Back-End (Node.js)

Start the API server:

```bash
cd backend
npm start
```

The server will typically run on:

```
http://localhost:3000
```

---

## How It Works (MVP Summary)

* Admin sets up teams and manages role assignments.
* Manager creates a project and divides it into tasks.
* Team Lead assigns tasks to team members.
* Users update their task progress.
* System reflects role-specific access and screens.

---

## Contributing

Feel free to fork this repository and submit pull requests with improvements or new features.

---

## License

This project is licensed under the **MIT License**.

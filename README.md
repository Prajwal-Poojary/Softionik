# MERN Real-Time Chat App

A full-stack real-time chat application using MongoDB, Express, React, Node.js, and Socket.io.

## Features
*   Authentication (Login/Signup with JWT)
*   Real-time Messaging (Socket.io)
*   One-to-One Chat
*   Group Chat (Create, Rename, Add/Remove users)
*   Typing Indicators
*   Notifications
*   Responsive UI with Tailwind CSS

## Tech Stack
*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Axios
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io

## Installation & Setup

1.  **Clone the repository** (if applicable)

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    *   Create a `.env` file in `backend/` and add:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
        NODE_ENV=development
        ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```
    *   (Optional) If you want to customize the API endpoint, check `vite.config.ts`. It proxies `/api` to `http://localhost:5000`.

## Running the App

1.  **Start Backend**
    ```bash
    cd backend
    npm run dev
    ```
    Server runs on `http://localhost:5000`.

2.  **Start Frontend** (in a new terminal)
    ```bash
    cd frontend
    npm run dev
    ```
    Client runs on `http://localhost:5173`.

## API Endpoints

*   **POST** `/api/user` - Register
*   **POST** `/api/user/login` - Login
*   **GET** `/api/user?search=` - Search Users
*   **POST** `/api/chat` - Access/Create Chat
*   **GET** `/api/chat` - Fetch Chats
*   **POST** `/api/chat/group` - Create Group
*   **POST** `/api/message` - Send Message
*   **GET** `/api/message/:chatId` - Fetch Messages

## Notes
*   Make sure MongoDB IP Whitelist allows your connection.
*   For file uploads (images), the structure supports it but currently using URL strings.

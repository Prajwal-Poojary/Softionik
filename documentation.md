# Softionik - Project Documentation

## 1. Project Overview
**Softionik** is a full-stack real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js). It supports one-on-one messaging, group chats, real-time typing indicators, notifications, and video calling features.

## 2. Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Real-time Engine**: Socket.io
- **Authentication**: JSON Web Tokens (JWT)
- **File Uploads**: Multer
- **Password Hashing**: BcryptJS

### Frontend
- **Framework**: React (built with Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Context API (ChatProvider, ThemeProvider)
- **HTTP Client**: Axios
- **Real-time Client**: Socket.io-client
- **WebRTC/Calling**: Simple Peer
- **Animations**: Framer Motion
- **UI Components**: React Icons, Lucide React

## 3. Project Structure

### Root Directory
- `backend/`: Contains all server-side code.
- `frontend/`: Contains all client-side code.
- `README.md`: Basic overview and setup instructions.

### Backend Structure (`/backend`)
- **`config/`**: Database connection logic (`db.js`).
- **`controllers/`**: Logic for handling API requests.
    - `userController.js`: Auth & user management.
    - `chatController.js`: Chat creation and fetching.
    - `messageController.js`: Sending/receiving messages.
    - `storyController.js`: Story management.
- **`middleware/`**:
    - `authMiddleware.js`: JWT verification (`protect` middleware).
    - `errorMiddleware.js`: Error handling logic.
- **`models/`**: Mongoose Schemas.
    - `userModel.js`: User schema.
    - `chatModel.js`: Chat/Group schema.
    - `messageModel.js`: Message schema.
    - `storyModel.js`: Story schema.
- **`routes/`**: API Route definitions.
    - `userRoutes.js`, `chatRoutes.js`, `messageRoutes.js`, `storyRoutes.js`.
- **`server.js`**: Main entry point. Sets up Express, Database, and Socket.io.

### Frontend Structure (`/frontend/src`)
- **`assets/`**: Static assets.
- **`components/`**: Reusable UI components.
    - Includes `SingleChat`, `MyChats`, `ChatBox`, `ScrollableChat`, `Navbar`, etc.
- **`Context/`**: Global State Management.
    - `ChatProvider.tsx`: Manages user, chats, and notifications state.
    - `ThemeContext.tsx`: Manages Light/Dark mode.
- **`pages/`**: Main Application Pages.
    - `HomePage.tsx`: Login/Signup landing page.
    - `ChatPage.tsx`: Main chat interface.
- **`App.tsx`**: Main component and Route definitions.
- **`main.tsx`**: Entry point, wraps App with Providers (Router, Chat, Theme).

## 4. Setup & Installation

### Prerequisites
- Node.js installed.
- MongoDB instance (Local or Atlas).

### Environment Variables
Create a `.env` file in the `backend/` directory with the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Installation Steps
1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Start the server
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    # Start the client
    npm run dev
    ```

## 5. API Documentation

### Base URL
By default: `http://localhost:5000/api`

### User Endpoints (`/api/user`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Register a new user | No |
| `POST` | `/login` | Login user | No |
| `GET` | `/` | Search/Get users (query param `?search=`) | **Yes** |

### Chat Endpoints (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Access or create a one-on-one chat | **Yes** |
| `GET` | `/` | Fetch all chats for the user | **Yes** |
| `POST` | `/group` | Create a group chat | **Yes** |
| `PUT` | `/rename` | Rename a group chat | **Yes** |
| `PUT` | `/groupadd` | Add user to group | **Yes** |
| `PUT` | `/groupremove` | Remove user from group | **Yes** |

### Message Endpoints (`/api/message`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Send a message (supports file upload) | **Yes** |
| `GET` | `/:chatId` | Fetch all messages for a specific chat | **Yes** |

### Story Endpoints (`/api/story`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get stories | **Yes** |
| `POST` | `/` | Post a story | **Yes** |

## 6. Real-time Features (Socket.io)
The application uses Socket.io for real-time events.
- **`connection`**: Triggered when a user connects.
- **`setup`**: User joins their own personal room (based on User ID).
- **`join chat`**: User joins a specific chat room.
- **`typing` / `stop typing`**: Real-time typing indicators.
- **`new message`**: Broadcasts new messages to other users in the chat.
- **`callUser` / `answerCall`**: Signaling events for video calls.

## 7. Database Schema (Key Models)
- **User**: Name, Email, Password, Picture.
- **Chat**: ChatName, isGroupChat, Users (Array of specific User Refs), LatestMessage, GroupAdmin.
- **Message**: Sender (User Ref), Content, Chat (Chat Ref).

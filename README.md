# TaskFlow

Real-Time Task Collaboration Platform - A lightweight Trello/Notion hybrid with real-time collaboration.

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO for real-time updates
- JWT Authentication

### Frontend
- React 18 with Vite
- Redux Toolkit + RTK Query
- Tailwind CSS
- @dnd-kit for drag-and-drop

## Project Structure

```
taskflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   ├── features/       # Feature modules
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API & socket config
│   │   ├── store/          # Redux store
│   │   └── utils/          # Helpers
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # DB & env config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, validation
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── services/           # Business logic
│   ├── socket/             # Socket.IO setup
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js v18+
- MongoDB v6+ (local or MongoDB Atlas)
- npm v9+

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd taskflow
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env if needed
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3008
- Health Check: http://localhost:3008/api/health

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=3008
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```
VITE_API_URL=http://localhost:3008/api/v1
VITE_SOCKET_URL=http://localhost:3008
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | alice@taskflow.demo | Demo@1234 |
| Member | bob@taskflow.demo | Demo@1234 |
| Member | carol@taskflow.demo | Demo@1234 |

## Features

- User authentication (signup/login)
- Create and manage boards
- Create lists within boards
- Create, update, delete tasks
- Drag and drop tasks across lists
- Assign users to tasks
- Real-time updates across users
- Activity history tracking
- Search and pagination

## API Documentation

Base URL: `/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Boards
- `GET /boards` - List user boards
- `POST /boards` - Create board
- `GET /boards/:id` - Get board details
- `PUT /boards/:id` - Update board
- `DELETE /boards/:id` - Delete board

### Lists
- `GET /boards/:boardId/lists` - Get lists
- `POST /boards/:boardId/lists` - Create list
- `PUT /lists/:id` - Update list
- `DELETE /lists/:id` - Delete list

### Tasks
- `GET /lists/:listId/tasks` - Get tasks
- `POST /lists/:listId/tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/move` - Move task

## License

MIT

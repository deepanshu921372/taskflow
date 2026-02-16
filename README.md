# TaskFlow

Real-Time Task Collaboration Platform - A lightweight Trello/Notion hybrid with real-time collaboration.

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO for real-time updates
- JWT Authentication

### Frontend
- React 19 with Vite
- Redux Toolkit + RTK Query
- Tailwind CSS
- @dnd-kit for drag-and-drop

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design, data flow, scalability |
| [API Documentation](./docs/API.md) | Complete API reference |
| [Database Schema](./docs/DATABASE_SCHEMA.md) | Collections, relationships, indexes |

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
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DATABASE_SCHEMA.md
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

### 4. Seed Demo Data (Optional)

```bash
cd server
npm run seed
```

### 5. Run Development Servers

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

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3008
- Health Check: http://localhost:3008/api/health

## Running Tests

### Backend Tests

```bash
cd server
npm install mongodb-memory-server --save-dev  # First time only
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

### Frontend Tests

```bash
cd client
npm test                 # Run all tests
npm run test:coverage    # With coverage report
```

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

### Core Features
- User authentication (signup/login)
- Create and manage boards
- Create lists within boards
- Create, update, delete tasks
- Drag and drop tasks across lists
- Assign users to tasks
- Real-time updates across users
- Activity history tracking
- Search and filter functionality

### Technical Features
- JWT-based authentication with secure password hashing
- WebSocket real-time sync with room-based isolation
- RTK Query for efficient data fetching and caching
- Responsive design with Tailwind CSS
- Comprehensive test coverage

## API Overview

Base URL: `/api/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login user |
| `/auth/me` | GET | Get current user |
| `/boards` | GET/POST | List/Create boards |
| `/boards/:id` | GET/PUT/DELETE | Board CRUD |
| `/boards/:id/members` | POST/DELETE | Manage members |
| `/boards/:boardId/lists` | GET/POST | List management |
| `/lists/:listId/tasks` | GET/POST | Task management |
| `/tasks/:id` | GET/PUT/DELETE | Task CRUD |
| `/tasks/:id/move` | PATCH | Move task |
| `/tasks/:id/assign` | POST/DELETE | Task assignment |
| `/boards/:boardId/activities` | GET | Activity history |

For complete API documentation, see [docs/API.md](./docs/API.md).

## Assumptions & Trade-offs

### Assumptions
1. Users have modern browsers with WebSocket support
2. MongoDB is available (local or cloud)
3. Single server deployment initially
4. Board membership is required to access any board data

### Trade-offs
1. **Soft delete not implemented** - Data is permanently deleted for simplicity
2. **No file attachments** - Focused on core task management
3. **Simple text search** - MongoDB text search instead of Elasticsearch
4. **No email notifications** - Real-time updates are primary notification method
5. **No offline support** - Requires active connection for updates

### Future Improvements
- Redis caching for performance
- Elasticsearch for advanced search
- File attachments with S3
- Email notifications
- Offline support with service workers
- Rate limiting for API protection

## License

MIT

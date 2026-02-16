# Architecture Documentation

## System Overview

TaskFlow is a real-time task collaboration platform built with a modern full-stack architecture. It enables teams to create boards, manage tasks, and collaborate in real-time.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   React     │  │   Redux     │  │     Socket.IO Client    │ │
│  │   Router    │  │   Toolkit   │  │                         │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          │      HTTP/REST │                      │ WebSocket
          │                │                      │
┌─────────┼────────────────┼──────────────────────┼───────────────┐
│         ▼                ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Express.js Server                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │   │
│  │  │  Routes  │  │  Auth    │  │    Socket.IO Server    │ │   │
│  │  │          │  │  (JWT)   │  │                        │ │   │
│  │  └────┬─────┘  └────┬─────┘  └───────────┬────────────┘ │   │
│  │       │             │                    │              │   │
│  │       ▼             ▼                    ▼              │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                  Controllers                      │   │   │
│  │  └────────────────────────┬─────────────────────────┘   │   │
│  └───────────────────────────┼─────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      MongoDB (Mongoose)                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           Server                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Redux Toolkit | 2.1.0 | State Management |
| RTK Query | 2.1.0 | Data Fetching & Caching |
| React Router | 6.22.0 | Client-side Routing |
| Socket.IO Client | 4.7.4 | Real-time Communication |
| @dnd-kit | 6.1.0 | Drag and Drop |
| Tailwind CSS | 3.4.1 | Styling |
| Vite | 7.3.1 | Build Tool |

### Directory Structure

```
client/src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Button, Input, Spinner)
│   └── Layout/          # Layout components (Navbar)
├── features/            # Feature-based modules
│   ├── auth/           # Authentication (Login, Register, authSlice)
│   ├── boards/         # Board management (Dashboard, BoardPage)
│   ├── lists/          # List components (ListColumn)
│   ├── tasks/          # Task components (TaskCard, TaskModal)
│   └── activity/       # Activity history
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication state
│   └── useSocket.js    # Socket.IO integration
├── services/           # External services
│   ├── apiSlice.js     # RTK Query base config
│   └── socket.js       # Socket.IO client
├── store/              # Redux store configuration
├── utils/              # Utility functions
└── App.jsx             # Root component with routing
```

### State Management Strategy

#### 1. Server State (RTK Query)

RTK Query manages all server-side data with automatic caching and invalidation.

```javascript
// Tag-based cache invalidation
tagTypes: ['User', 'Board', 'Boards', 'List', 'Task', 'Activity']

// Example: Creating a task invalidates the Board cache
createTask: builder.mutation({
  invalidatesTags: ['Board'],
})
```

#### 2. Client State (Redux Slice)

Local state like authentication tokens is managed via Redux slices.

```javascript
// authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null },
  reducers: {
    setCredentials: (state, action) => { ... },
    logout: (state) => { ... },
  },
});
```

#### 3. Component State (useState)

UI-specific state is managed locally in components.

### Data Flow

```
User Action
    │
    ▼
Component (dispatch mutation)
    │
    ▼
RTK Query Mutation
    │
    ├──► API Request ──► Server ──► Database
    │
    ▼
Cache Invalidation
    │
    ▼
Automatic Refetch
    │
    ▼
UI Update
```

---

## Backend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18.2 | Web Framework |
| MongoDB | 6+ | Database |
| Mongoose | 8.1.1 | ODM |
| Socket.IO | 4.7.4 | Real-time Communication |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password Hashing |
| Helmet | 7.1.0 | Security Headers |

### Directory Structure

```
server/
├── config/             # Configuration
│   ├── db.js          # MongoDB connection
│   └── env.js         # Environment validation
├── controllers/        # Request handlers
│   ├── auth.controller.js
│   ├── board.controller.js
│   ├── list.controller.js
│   ├── task.controller.js
│   └── activity.controller.js
├── middleware/         # Express middleware
│   ├── auth.js        # JWT verification
│   ├── boardAccess.js # Board membership check
│   ├── errorHandler.js
│   └── validate.js
├── models/            # Mongoose schemas
│   ├── User.js
│   ├── Board.js
│   ├── List.js
│   ├── Task.js
│   └── Activity.js
├── routes/            # API routes
├── services/          # Business logic
│   ├── activity.service.js
│   └── socket.service.js
├── socket/            # Socket.IO setup
│   └── index.js
├── utils/             # Utilities
│   ├── apiResponse.js
│   ├── AppError.js
│   └── seed.js
└── server.js          # Entry point
```

### Request Lifecycle

```
Incoming Request
    │
    ▼
Middleware Stack
    ├── helmet()           # Security headers
    ├── cors()             # CORS handling
    ├── express.json()     # Body parsing
    ├── morgan()           # Logging
    ├── authMiddleware     # JWT verification
    └── boardAccess        # Permission check
    │
    ▼
Route Handler
    │
    ▼
Controller
    │
    ├──► Database Operation (Mongoose)
    ├──► Activity Logging
    └──► Socket Emission (if needed)
    │
    ▼
ApiResponse
    │
    ▼
JSON Response
```

### Error Handling

```javascript
// Custom error class
class AppError extends Error {
  static badRequest(message) { return new AppError(message, 400); }
  static unauthorized(message) { return new AppError(message, 401); }
  static forbidden(message) { return new AppError(message, 403); }
  static notFound(message) { return new AppError(message, 404); }
  static conflict(message) { return new AppError(message, 409); }
}

// Global error handler catches all errors
app.use(errorHandler);
```

---

## Real-Time Sync Strategy

### Socket.IO Architecture

```
Client A                    Server                    Client B
   │                          │                          │
   │── join:board ──────────►│                          │
   │                          │◄────── join:board ──────│
   │                          │                          │
   │── task:create ─────────►│                          │
   │                          │─── task:created ───────►│
   │                          │                          │
   │◄─── task:created ───────│                          │
```

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:board` | Client → Server | Join a board's room |
| `leave:board` | Client → Server | Leave a board's room |
| `board:updated` | Server → Client | Board properties changed |
| `list:created` | Server → Client | New list created |
| `list:updated` | Server → Client | List updated |
| `list:deleted` | Server → Client | List deleted |
| `task:created` | Server → Client | New task created |
| `task:updated` | Server → Client | Task updated |
| `task:moved` | Server → Client | Task moved between lists |
| `task:deleted` | Server → Client | Task deleted |
| `member:added` | Server → Client | Member joined board |
| `member:removed` | Server → Client | Member left board |

### Room Management

```javascript
// Server-side room management
socket.on('join:board', (boardId) => {
  socket.join(`board:${boardId}`);
});

socket.on('leave:board', (boardId) => {
  socket.leave(`board:${boardId}`);
});

// Emit to all members of a board
io.to(`board:${boardId}`).emit('task:created', taskData);
```

### Client-Side Integration

```javascript
// useSocket hook
const useSocket = (boardId) => {
  useEffect(() => {
    socket.emit('join:board', boardId);

    socket.on('task:created', () => {
      dispatch(apiSlice.util.invalidateTags([{ type: 'Board', id: boardId }]));
    });

    return () => {
      socket.emit('leave:board', boardId);
      socket.off('task:created');
    };
  }, [boardId]);
};
```

### Sync Flow

1. **User performs action** (e.g., creates task)
2. **API request** sent to server
3. **Server processes** request and saves to database
4. **Server emits** socket event to board room
5. **All connected clients** receive event
6. **RTK Query cache** invalidated on each client
7. **UI updates** automatically via refetch

---

## Scalability Considerations

### Current Architecture Limitations

1. **Single Server**: No horizontal scaling
2. **In-Memory Socket State**: Lost on restart
3. **No Caching Layer**: Every request hits database
4. **No Rate Limiting**: Vulnerable to abuse

### Recommended Improvements for Scale

#### 1. Database Layer

```
Current:
  App Server ──► MongoDB

Recommended:
  App Servers ──► MongoDB Replica Set
       │               │
       └───► Redis ◄───┘ (Cache + Sessions)
```

- **MongoDB Replica Set**: High availability and read scaling
- **Redis Cache**: Reduce database load for frequent reads
- **Connection Pooling**: Efficient database connections

#### 2. Application Layer

```
Current:
  Client ──► Single Server

Recommended:
  Client ──► Load Balancer ──► Server Pool
                   │
                   ├──► Server 1
                   ├──► Server 2
                   └──► Server N
```

- **Load Balancer**: Distribute traffic (nginx, HAProxy)
- **Stateless Servers**: No local state, all in Redis/DB
- **Auto-scaling**: Add servers based on load

#### 3. Real-Time Layer

```
Current:
  Client ──► Single Socket Server

Recommended:
  Client ──► Socket.IO ──► Redis Adapter
                │
                ├──► Server 1 ◄──┐
                ├──► Server 2 ◄──┼── Redis Pub/Sub
                └──► Server N ◄──┘
```

- **Redis Adapter**: Share socket state across servers
- **Sticky Sessions**: Route same client to same server

#### 4. Performance Optimizations

| Area | Current | Recommended |
|------|---------|-------------|
| Database | Direct queries | Redis caching |
| API | No rate limit | Rate limiting per user |
| Queries | No pagination limit | Enforce max page size |
| Images | Direct upload | CDN + compression |
| Search | MongoDB text | Elasticsearch |

#### 5. Monitoring & Observability

- **Logging**: Structured logs with correlation IDs
- **Metrics**: Request latency, error rates, DB performance
- **Tracing**: Distributed tracing for request flow
- **Alerting**: Automated alerts for anomalies

### Deployment Architecture (Production)

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN + WAF)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Load Balancer  │
                    │    (nginx)      │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
│   App Server 1  │ │   App Server 2  │ │   App Server N  │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐  ┌──────▼──────┐  ┌───▼───┐
     │   MongoDB   │  │    Redis    │  │  S3   │
     │   Cluster   │  │   Cluster   │  │ Files │
     └─────────────┘  └─────────────┘  └───────┘
```

---

## Security Measures

### Current Implementation

1. **Authentication**: JWT with secure secret
2. **Password Hashing**: bcrypt (12 rounds)
3. **CORS**: Whitelist configured origins
4. **Headers**: Helmet for security headers
5. **Input Validation**: express-validator
6. **Authorization**: Board membership checks

### Recommended Additions

1. **Rate Limiting**: Prevent brute force
2. **HTTPS**: SSL/TLS encryption
3. **Input Sanitization**: XSS prevention
4. **Audit Logging**: Track sensitive actions
5. **2FA**: Optional two-factor auth

---

## Testing Strategy

### Backend Tests

- **Unit Tests**: Model methods, utilities
- **Integration Tests**: API endpoints with database
- **Framework**: Jest + Supertest + MongoDB Memory Server

### Frontend Tests

- **Unit Tests**: Components, hooks
- **Integration Tests**: User flows
- **Framework**: Vitest + React Testing Library

### Test Commands

```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

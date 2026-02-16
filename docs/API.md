# API Documentation

## Base URL

```
http://localhost:3008/api/v1
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

## Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 500 | INTERNAL_ERROR | Server error |

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login User

**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Get Current User

**GET** `/auth/me`

Returns the authenticated user's profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Update Profile

**PUT** `/auth/me`

Updates the authenticated user's profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Updated",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

---

## Board Endpoints

### List Boards

**GET** `/boards`

Returns all boards the user is a member of.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search in title/description |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Project Alpha",
      "description": "Main project board",
      "background": "#1B4F72",
      "owner": "507f1f77bcf86cd799439012",
      "members": [
        { "_id": "507f1f77bcf86cd799439012", "name": "John", "email": "john@example.com" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### Create Board

**POST** `/boards`

Creates a new board with the current user as owner.

**Request Body:**
```json
{
  "title": "New Project",
  "description": "Project description",
  "background": "#FF5733"
}
```

**Validation:**
- `title`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `background`: Optional, hex color

**Response (201):**
```json
{
  "success": true,
  "data": {
    "board": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "New Project",
      "description": "Project description",
      "background": "#FF5733",
      "owner": "507f1f77bcf86cd799439012",
      "members": [
        { "_id": "507f1f77bcf86cd799439012", "name": "John", "email": "john@example.com" }
      ]
    }
  }
}
```

---

### Get Board

**GET** `/boards/:id`

Returns board details with lists and tasks.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "board": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Project Alpha",
      "members": [ ... ]
    },
    "lists": [
      { "_id": "...", "title": "To Do", "position": 0 },
      { "_id": "...", "title": "In Progress", "position": 1 }
    ],
    "tasks": [
      { "_id": "...", "title": "Task 1", "list": "...", "position": 0, "priority": "high" }
    ]
  }
}
```

---

### Update Board

**PUT** `/boards/:id`

Updates board properties.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "background": "#3498DB"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "board": { ... }
  }
}
```

---

### Delete Board

**DELETE** `/boards/:id`

Deletes the board and all its lists/tasks. Only the owner can delete.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Board deleted successfully"
  }
}
```

---

### Add Member

**POST** `/boards/:id/members`

Adds a user to the board by email.

**Request Body:**
```json
{
  "email": "newmember@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "board": { ... }
  }
}
```

---

### Remove Member

**DELETE** `/boards/:id/members/:userId`

Removes a member from the board. Cannot remove the owner.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "board": { ... }
  }
}
```

---

## List Endpoints

### Get Lists

**GET** `/boards/:boardId/lists`

Returns all lists for a board.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "title": "To Do", "position": 0 },
    { "_id": "...", "title": "In Progress", "position": 1 }
  ]
}
```

---

### Create List

**POST** `/boards/:boardId/lists`

Creates a new list in the board.

**Request Body:**
```json
{
  "title": "New List"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "list": {
      "_id": "...",
      "title": "New List",
      "board": "...",
      "position": 2
    }
  }
}
```

---

### Update List

**PUT** `/lists/:id`

Updates list properties.

**Request Body:**
```json
{
  "title": "Updated List Name"
}
```

---

### Delete List

**DELETE** `/lists/:id`

Deletes the list and all its tasks.

---

### Reorder Lists

**PATCH** `/lists/reorder`

Reorders lists within a board.

**Request Body:**
```json
{
  "lists": [
    { "id": "list1", "position": 0 },
    { "id": "list2", "position": 1 },
    { "id": "list3", "position": 2 }
  ]
}
```

---

## Task Endpoints

### Get Tasks

**GET** `/lists/:listId/tasks`

Returns tasks for a list with pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Items per page |
| `search` | string | - | Search in title/description |

---

### Create Task

**POST** `/lists/:listId/tasks`

Creates a new task in the list.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

**Validation:**
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `priority`: Optional, one of: low, medium, high, urgent
- `dueDate`: Optional, ISO date string

---

### Get Task

**GET** `/tasks/:id`

Returns a single task with assignee details.

---

### Update Task

**PUT** `/tasks/:id`

Updates task properties.

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "priority": "urgent",
  "dueDate": "2024-12-31",
  "labels": ["bug", "urgent"]
}
```

---

### Delete Task

**DELETE** `/tasks/:id`

Deletes the task.

---

### Move Task

**PATCH** `/tasks/:id/move`

Moves task to a different list or position.

**Request Body:**
```json
{
  "targetListId": "507f1f77bcf86cd799439011",
  "position": 0
}
```

---

### Assign User

**POST** `/tasks/:id/assign`

Assigns a user to the task.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

---

### Unassign User

**DELETE** `/tasks/:id/assign/:userId`

Removes a user from the task's assignees.

---

## Activity Endpoints

### Get Activities

**GET** `/boards/:boardId/activities`

Returns activity history for a board.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `action` | string | - | Filter by action type |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "user": { "_id": "...", "name": "John", "email": "..." },
      "action": "created",
      "entityType": "task",
      "entityTitle": "New Feature",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Health Check

**GET** `/api/health`

Returns server health status.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

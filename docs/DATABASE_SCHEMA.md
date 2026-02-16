# Database Schema Documentation

## Overview

TaskFlow uses MongoDB as its database. The schema is designed to support a collaborative task management platform with real-time updates.

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │      Board      │       │      List       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ _id             │◄──────│ owner           │       │ _id             │
│ name            │       │ members[]       │◄──────│ board           │
│ email           │◄──────│ title           │       │ title           │
│ password        │       │ description     │       │ position        │
│ avatar          │       │ background      │       │ timestamps      │
│ timestamps      │       │ timestamps      │       └────────┬────────┘
└────────┬────────┘       └────────┬────────┘                │
         │                         │                         │
         │                         │                         ▼
         │                         │              ┌─────────────────┐
         │                         │              │      Task       │
         │                         │              ├─────────────────┤
         │                         └─────────────►│ board           │
         │                                        │ list            │
         └───────────────────────────────────────►│ assignees[]     │
                                                  │ title           │
                                                  │ description     │
                                                  │ position        │
                                                  │ priority        │
                                                  │ dueDate         │
                                                  │ labels[]        │
                                                  │ timestamps      │
                                                  └────────┬────────┘
                                                           │
         ┌─────────────────┐                               │
         │    Activity     │◄──────────────────────────────┘
         ├─────────────────┤
         │ _id             │
         │ user            │
         │ board           │
         │ action          │
         │ entityType      │
         │ entityId        │
         │ entityTitle     │
         │ details         │
         │ timestamps      │
         └─────────────────┘
```

## Collections

### User Collection

Stores user account information and authentication details.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier |
| `name` | String | Yes | User's display name (2-50 chars) |
| `email` | String | Yes | Unique, lowercase email |
| `password` | String | Yes | Bcrypt hashed (min 6 chars raw) |
| `avatar` | String | No | URL to avatar image |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `email`: Unique index for fast lookups and uniqueness

**Methods:**
- `comparePassword(candidatePassword)`: Validates password
- `generateToken()`: Creates JWT token

**Hooks:**
- `pre-save`: Hashes password with bcryptjs (12 rounds)

---

### Board Collection

Represents a project board containing lists and tasks.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier |
| `title` | String | Yes | Board title (1-100 chars) |
| `description` | String | No | Board description (max 500 chars) |
| `owner` | ObjectId | Yes | Reference to User (board creator) |
| `members` | [ObjectId] | Yes | Array of User references |
| `background` | String | No | Hex color code (default: #1B4F72) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `owner`: For fast user board queries
- `members`: For membership queries
- Text index on `title` and `description` for search

---

### List Collection

Represents a column/list within a board.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier |
| `title` | String | Yes | List title (1-100 chars) |
| `board` | ObjectId | Yes | Reference to Board |
| `position` | Number | Yes | Order position (0-indexed) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- Compound index on `board` + `position` for sorted queries

---

### Task Collection

Represents a task/card within a list.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier |
| `title` | String | Yes | Task title (1-200 chars) |
| `description` | String | No | Task description (max 2000 chars) |
| `list` | ObjectId | Yes | Reference to List |
| `board` | ObjectId | Yes | Reference to Board |
| `position` | Number | Yes | Order position within list |
| `priority` | String | No | Enum: low, medium, high, urgent (default: medium) |
| `dueDate` | Date | No | Task deadline |
| `assignees` | [ObjectId] | No | Array of User references |
| `labels` | [String] | No | Array of label strings |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- Compound index on `list` + `position` for sorted task queries
- `board`: For board-level task queries
- `assignees`: For user assignment queries
- Text index on `title` and `description` for search

---

### Activity Collection

Tracks all actions performed on the board for activity history.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier |
| `user` | ObjectId | Yes | Reference to User who performed action |
| `board` | ObjectId | Yes | Reference to Board |
| `action` | String | Yes | Enum: created, updated, moved, deleted, assigned, unassigned, archived |
| `entityType` | String | Yes | Enum: board, list, task |
| `entityId` | ObjectId | No | ID of affected entity |
| `entityTitle` | String | No | Title of affected entity (for display) |
| `details` | Mixed | No | Additional context (e.g., fromList, toList for moves) |
| `createdAt` | Date | Auto | When action occurred |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- Compound index on `board` + `createdAt` for efficient activity queries

---

## Data Relationships

### One-to-Many Relationships

1. **User → Boards (as owner)**
   - A user can own multiple boards
   - Cascade: When user is deleted, owned boards should be deleted

2. **Board → Lists**
   - A board contains multiple lists
   - Cascade: When board is deleted, all lists are deleted

3. **List → Tasks**
   - A list contains multiple tasks
   - Cascade: When list is deleted, all tasks are deleted

4. **Board → Activities**
   - A board has many activity records
   - Cascade: When board is deleted, activities are deleted

### Many-to-Many Relationships

1. **Board ↔ Users (as members)**
   - A board can have multiple members
   - A user can be a member of multiple boards
   - Implemented via: `board.members` array

2. **Task ↔ Users (as assignees)**
   - A task can have multiple assignees
   - A user can be assigned to multiple tasks
   - Implemented via: `task.assignees` array

---

## Indexing Strategy

### Performance Indexes

| Collection | Index | Purpose |
|------------|-------|---------|
| User | `email` (unique) | Fast login, prevent duplicates |
| Board | `owner` | User's owned boards |
| Board | `members` | User's accessible boards |
| List | `board, position` | Ordered lists per board |
| Task | `list, position` | Ordered tasks per list |
| Task | `board` | All tasks in a board |
| Task | `assignees` | User's assigned tasks |
| Activity | `board, createdAt` | Board activity timeline |

### Text Search Indexes

| Collection | Fields | Purpose |
|------------|--------|---------|
| Board | `title, description` | Board search |
| Task | `title, description` | Task search |

---

## Data Integrity Rules

1. **User email uniqueness**: Enforced at database level
2. **Board owner must be a member**: Enforced in application logic
3. **Task assignees must be board members**: Enforced in application logic
4. **Position ordering**: Auto-incremented per parent (list/board)
5. **Cascade deletes**: Implemented in controllers, not database triggers

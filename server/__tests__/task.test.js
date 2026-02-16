const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const taskRoutes = require('../routes/task.routes');
const listRoutes = require('../routes/list.routes');

const app = express();
app.use(express.json());
app.use('/api/v1', taskRoutes);
app.use('/api/v1', listRoutes);

describe('Task Endpoints', () => {
  let user, token, board, list, otherUser, otherToken;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    token = user.generateToken();

    otherUser = await User.create({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
    });
    otherToken = otherUser.generateToken();

    board = await Board.create({
      title: 'Test Board',
      owner: user._id,
      members: [user._id, otherUser._id],
    });

    list = await List.create({
      title: 'Test List',
      board: board._id,
      position: 0,
    });
  });

  describe('POST /api/v1/lists/:listId/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post(`/api/v1/lists/${list._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'A test task',
          priority: 'high',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task).toHaveProperty('title', 'Test Task');
      expect(res.body.data.task).toHaveProperty('priority', 'high');
      expect(res.body.data.task).toHaveProperty('position', 0);
    });

    it('should auto-increment position', async () => {
      await Task.create({
        title: 'Task 1',
        list: list._id,
        board: board._id,
        position: 0,
      });

      const res = await request(app)
        .post(`/api/v1/lists/${list._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task 2',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.task).toHaveProperty('position', 1);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post(`/api/v1/lists/${list._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/lists/:listId/tasks', () => {
    beforeEach(async () => {
      await Task.create({
        title: 'Task 1',
        list: list._id,
        board: board._id,
        position: 0,
        priority: 'low',
      });
      await Task.create({
        title: 'Task 2',
        list: list._id,
        board: board._id,
        position: 1,
        priority: 'high',
      });
    });

    it('should get all tasks for a list', async () => {
      const res = await request(app)
        .get(`/api/v1/lists/${list._id}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return tasks sorted by position', async () => {
      const res = await request(app)
        .get(`/api/v1/lists/${list._id}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.data[0]).toHaveProperty('position', 0);
      expect(res.body.data[1]).toHaveProperty('position', 1);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        list: list._id,
        board: board._id,
        position: 0,
      });
    });

    it('should get task by id', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task).toHaveProperty('title', 'Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/v1/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        list: list._id,
        board: board._id,
        position: 0,
        priority: 'medium',
      });
    });

    it('should update task', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task',
          priority: 'urgent',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task).toHaveProperty('title', 'Updated Task');
      expect(res.body.data.task).toHaveProperty('priority', 'urgent');
    });

    it('should update due date', async () => {
      const dueDate = new Date('2025-12-31');
      const res = await request(app)
        .put(`/api/v1/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          dueDate: dueDate.toISOString(),
        });

      expect(res.status).toBe(200);
      expect(new Date(res.body.data.task.dueDate).toDateString()).toBe(dueDate.toDateString());
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        list: list._id,
        board: board._id,
        position: 0,
      });
    });

    it('should delete task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('PATCH /api/v1/tasks/:id/move', () => {
    let task, list2;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        list: list._id,
        board: board._id,
        position: 0,
      });

      list2 = await List.create({
        title: 'List 2',
        board: board._id,
        position: 1,
      });
    });

    it('should move task to another list', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${task._id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetListId: list2._id.toString(),
          position: 0,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.list.toString()).toBe(list2._id.toString());
    });

    it('should return 404 for non-existent target list', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .patch(`/api/v1/tasks/${task._id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetListId: fakeId,
          position: 0,
        });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/tasks/:id/assign', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        list: list._id,
        board: board._id,
        position: 0,
      });
    });

    it('should assign user to task', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/${task._id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: otherUser._id.toString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.assignees).toHaveLength(1);
    });

    it('should not assign same user twice', async () => {
      await Task.findByIdAndUpdate(task._id, {
        $push: { assignees: otherUser._id },
      });

      const res = await request(app)
        .post(`/api/v1/tasks/${task._id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: otherUser._id.toString(),
        });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/v1/tasks/:id/assign/:userId', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        list: list._id,
        board: board._id,
        position: 0,
        assignees: [otherUser._id],
      });
    });

    it('should unassign user from task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${task._id}/assign/${otherUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.assignees).toHaveLength(0);
    });
  });
});

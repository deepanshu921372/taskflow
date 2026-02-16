const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const Board = require('../models/Board');
const boardRoutes = require('../routes/board.routes');
const authMiddleware = require('../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/v1/boards', boardRoutes);

describe('Board Endpoints', () => {
  let user, token, otherUser, otherToken;

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
  });

  describe('POST /api/v1/boards', () => {
    it('should create a new board', async () => {
      const res = await request(app)
        .post('/api/v1/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Board',
          description: 'A test board',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.board).toHaveProperty('title', 'Test Board');
      expect(res.body.data.board.owner.toString()).toBe(user._id.toString());
      expect(res.body.data.board.members).toContainEqual(
        expect.objectContaining({ _id: user._id.toString() })
      );
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/boards')
        .send({
          title: 'Test Board',
        });

      expect(res.status).toBe(401);
    });

    it('should validate title is required', async () => {
      const res = await request(app)
        .post('/api/v1/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/boards', () => {
    beforeEach(async () => {
      await Board.create({
        title: 'Board 1',
        owner: user._id,
        members: [user._id],
      });
      await Board.create({
        title: 'Board 2',
        owner: user._id,
        members: [user._id],
      });
      await Board.create({
        title: 'Other Board',
        owner: otherUser._id,
        members: [otherUser._id],
      });
    });

    it('should get all boards for user', async () => {
      const res = await request(app)
        .get('/api/v1/boards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/boards?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toHaveProperty('total', 2);
      expect(res.body.pagination).toHaveProperty('pages', 2);
    });

    it('should support search', async () => {
      const res = await request(app)
        .get('/api/v1/boards?search=Board 1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/boards/:id', () => {
    let board;

    beforeEach(async () => {
      board = await Board.create({
        title: 'Test Board',
        owner: user._id,
        members: [user._id],
      });
    });

    it('should get board by id', async () => {
      const res = await request(app)
        .get(`/api/v1/boards/${board._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.board).toHaveProperty('title', 'Test Board');
    });

    it('should return 403 for non-member', async () => {
      const res = await request(app)
        .get(`/api/v1/boards/${board._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent board', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/v1/boards/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/boards/:id', () => {
    let board;

    beforeEach(async () => {
      board = await Board.create({
        title: 'Test Board',
        owner: user._id,
        members: [user._id],
      });
    });

    it('should update board', async () => {
      const res = await request(app)
        .put(`/api/v1/boards/${board._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Board',
          background: '#FF5733',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.board).toHaveProperty('title', 'Updated Board');
      expect(res.body.data.board).toHaveProperty('background', '#FF5733');
    });
  });

  describe('DELETE /api/v1/boards/:id', () => {
    let board;

    beforeEach(async () => {
      board = await Board.create({
        title: 'Test Board',
        owner: user._id,
        members: [user._id, otherUser._id],
      });
    });

    it('should delete board as owner', async () => {
      const res = await request(app)
        .delete(`/api/v1/boards/${board._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedBoard = await Board.findById(board._id);
      expect(deletedBoard).toBeNull();
    });

    it('should not allow non-owner to delete board', async () => {
      const res = await request(app)
        .delete(`/api/v1/boards/${board._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/boards/:id/members', () => {
    let board;

    beforeEach(async () => {
      board = await Board.create({
        title: 'Test Board',
        owner: user._id,
        members: [user._id],
      });
    });

    it('should add member to board', async () => {
      const res = await request(app)
        .post(`/api/v1/boards/${board._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'other@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.board.members).toHaveLength(2);
    });

    it('should not add non-existent user', async () => {
      const res = await request(app)
        .post(`/api/v1/boards/${board._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'nonexistent@example.com',
        });

      expect(res.status).toBe(404);
    });

    it('should not add existing member', async () => {
      const res = await request(app)
        .post(`/api/v1/boards/${board._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'test@example.com',
        });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/v1/boards/:id/members/:userId', () => {
    let board;

    beforeEach(async () => {
      board = await Board.create({
        title: 'Test Board',
        owner: user._id,
        members: [user._id, otherUser._id],
      });
    });

    it('should remove member from board', async () => {
      const res = await request(app)
        .delete(`/api/v1/boards/${board._id}/members/${otherUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.board.members).toHaveLength(1);
    });

    it('should not remove owner from board', async () => {
      const res = await request(app)
        .delete(`/api/v1/boards/${board._id}/members/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});

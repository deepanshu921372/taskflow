const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const taskController = require('../controllers/task.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth);

router.get('/lists/:listId/tasks', taskController.getTasks);

router.post(
  '/lists/:listId/tasks',
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  taskController.createTask
);

router.get('/tasks/:id', taskController.getTask);

router.put(
  '/tasks/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  taskController.updateTask
);

router.delete('/tasks/:id', taskController.deleteTask);

router.patch(
  '/tasks/:id/move',
  [
    body('targetListId').notEmpty().withMessage('Target list ID is required'),
    body('position').isNumeric().withMessage('Position is required'),
  ],
  validate,
  taskController.moveTask
);

router.post(
  '/tasks/:id/assign',
  [body('userId').notEmpty().withMessage('User ID is required')],
  validate,
  taskController.assignUser
);

router.delete('/tasks/:id/assign/:userId', taskController.unassignUser);

module.exports = router;

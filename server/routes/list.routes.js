const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const listController = require('../controllers/list.controller');
const auth = require('../middleware/auth');
const boardAccess = require('../middleware/boardAccess');
const validate = require('../middleware/validate');

router.use(auth);

router.get('/boards/:boardId/lists', boardAccess, listController.getLists);

router.post(
  '/boards/:boardId/lists',
  boardAccess,
  [body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters')],
  validate,
  listController.createList
);

router.put(
  '/lists/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('position').optional().isNumeric().withMessage('Position must be a number'),
  ],
  validate,
  listController.updateList
);

router.delete('/lists/:id', listController.deleteList);

router.patch(
  '/lists/reorder',
  [
    body('boardId').notEmpty().withMessage('Board ID is required'),
    body('listIds').isArray().withMessage('List IDs must be an array'),
  ],
  validate,
  listController.reorderLists
);

module.exports = router;

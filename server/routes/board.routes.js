const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const boardController = require('../controllers/board.controller');
const auth = require('../middleware/auth');
const boardAccess = require('../middleware/boardAccess');
const validate = require('../middleware/validate');

router.use(auth);

router.get('/', boardController.getBoards);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('background').optional().isHexColor().withMessage('Background must be a hex color'),
  ],
  validate,
  boardController.createBoard
);

router.get('/:id', boardAccess, boardController.getBoard);

router.put(
  '/:id',
  boardAccess,
  [
    body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('background').optional().isHexColor().withMessage('Background must be a hex color'),
  ],
  validate,
  boardController.updateBoard
);

router.delete('/:id', boardAccess, boardController.deleteBoard);

router.post(
  '/:id/members',
  boardAccess,
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  boardController.addMember
);

router.delete('/:id/members/:userId', boardAccess, boardController.removeMember);

module.exports = router;

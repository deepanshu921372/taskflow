const Board = require('../models/Board');
const AppError = require('../utils/AppError');

const boardAccess = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id || req.body.boardId;

    if (!boardId) {
      throw AppError.badRequest('Board ID is required');
    }

    const board = await Board.findById(boardId);

    if (!board) {
      throw AppError.notFound('Board not found');
    }

    const userId = req.user._id.toString();
    const isOwner = board.owner.toString() === userId;
    const isMember = board.members.some((m) => m.toString() === userId);

    if (!isOwner && !isMember) {
      throw AppError.forbidden('You do not have access to this board');
    }

    req.board = board;
    req.isOwner = isOwner;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = boardAccess;

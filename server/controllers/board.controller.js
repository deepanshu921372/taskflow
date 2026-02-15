const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { logActivity } = require('../services/activity.service');

exports.getBoards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const userId = req.user._id;

    const query = {
      $or: [{ owner: userId }, { members: userId }],
    };

    if (search) {
      query.$text = { $search: search };
    }

    const total = await Board.countDocuments(query);
    const boards = await Board.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    ApiResponse.paginated(res, boards, page, limit, total);
  } catch (error) {
    next(error);
  }
};

exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) {
      throw AppError.notFound('Board not found');
    }

    const lists = await List.find({ board: board._id }).sort({ position: 1 });
    const tasks = await Task.find({ board: board._id })
      .populate('assignees', 'name email')
      .sort({ position: 1 });

    ApiResponse.success(res, { board, lists, tasks });
  } catch (error) {
    next(error);
  }
};

exports.createBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;

    const board = await Board.create({
      title,
      description,
      background,
      owner: req.user._id,
      members: [req.user._id],
    });

    await board.populate('owner', 'name email');
    await board.populate('members', 'name email');

    await logActivity({
      user: req.user._id,
      board: board._id,
      action: 'created',
      entityType: 'board',
      entityId: board._id,
      entityTitle: board.title,
    });

    ApiResponse.created(res, { board });
  } catch (error) {
    next(error);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (background !== undefined) updates.background = background;

    const board = await Board.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email')
      .populate('members', 'name email');

    await logActivity({
      user: req.user._id,
      board: board._id,
      action: 'updated',
      entityType: 'board',
      entityId: board._id,
      entityTitle: board.title,
    });

    ApiResponse.success(res, { board });
  } catch (error) {
    next(error);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    const board = req.board;

    if (!req.isOwner) {
      throw AppError.forbidden('Only the board owner can delete the board');
    }

    await Task.deleteMany({ board: board._id });
    await List.deleteMany({ board: board._id });
    await Activity.deleteMany({ board: board._id });
    await Board.findByIdAndDelete(board._id);

    ApiResponse.success(res, { message: 'Board deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const board = req.board;

    const user = await User.findOne({ email });
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (board.members.includes(user._id)) {
      throw AppError.conflict('User is already a member');
    }

    board.members.push(user._id);
    await board.save();
    await board.populate('members', 'name email');

    await logActivity({
      user: req.user._id,
      board: board._id,
      action: 'assigned',
      entityType: 'board',
      entityId: board._id,
      entityTitle: board.title,
      details: { memberAdded: user.name },
    });

    ApiResponse.success(res, { board });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const board = req.board;
    const memberId = req.params.userId;

    if (board.owner.toString() === memberId) {
      throw AppError.badRequest('Cannot remove the board owner');
    }

    board.members = board.members.filter((m) => m.toString() !== memberId);
    await board.save();

    await Task.updateMany(
      { board: board._id },
      { $pull: { assignees: memberId } }
    );

    await board.populate('members', 'name email');

    ApiResponse.success(res, { board });
  } catch (error) {
    next(error);
  }
};

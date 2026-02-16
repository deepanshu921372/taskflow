const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { send, sendPaginated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { logActivity } = require('../services/activity.service');

exports.getBoards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user._id;

    const query = { $or: [{ owner: userId }, { members: userId }] };
    if (search) query.$text = { $search: search };

    const [total, boards] = await Promise.all([
      Board.countDocuments(query),
      Board.find(query)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(+limit)
    ]);

    sendPaginated(res, boards, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) throw AppError.notFound('Board not found');

    // get lists and tasks in parallel
    const [lists, tasks] = await Promise.all([
      List.find({ board: board._id }).sort('position'),
      Task.find({ board: board._id }).populate('assignees', 'name email').sort('position')
    ]);

    send(res, 200, { board, lists, tasks });
  } catch (err) {
    next(err);
  }
};

exports.createBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;

    const board = await Board.create({
      title, description, background,
      owner: req.user._id,
      members: [req.user._id]
    });

    await Promise.all([
      board.populate('owner', 'name email'),
      board.populate('members', 'name email')
    ]);

    logActivity({
      user: req.user._id, board: board._id,
      action: 'created', entityType: 'board',
      entityId: board._id, entityTitle: board.title
    });

    send(res, 201, { board });
  } catch (err) {
    next(err);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;

    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { ...(title && { title }), ...(description !== undefined && { description }), ...(background && { background }) },
      { new: true, runValidators: true }
    ).populate('owner', 'name email').populate('members', 'name email');

    logActivity({
      user: req.user._id, board: board._id,
      action: 'updated', entityType: 'board',
      entityId: board._id, entityTitle: board.title
    });

    send(res, 200, { board });
  } catch (err) {
    next(err);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    if (!req.isOwner) throw AppError.forbidden('Only owner can delete');

    const boardId = req.board._id;
    await Promise.all([
      Task.deleteMany({ board: boardId }),
      List.deleteMany({ board: boardId }),
      Activity.deleteMany({ board: boardId })
    ]);
    await Board.findByIdAndDelete(boardId);

    send(res, 200, { message: 'Board deleted' });
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { board } = req;

    const user = await User.findOne({ email });
    if (!user) throw AppError.notFound('User not found');
    if (board.members.some(m => m.equals(user._id))) {
      throw AppError.conflict('Already a member');
    }

    board.members.push(user._id);
    await board.save();
    await board.populate('members', 'name email');

    logActivity({
      user: req.user._id, board: board._id,
      action: 'assigned', entityType: 'board',
      entityId: board._id, entityTitle: board.title,
      details: { memberAdded: user.name }
    });

    send(res, 200, { board });
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { board } = req;
    const { userId } = req.params;

    if (board.owner.toString() === userId) {
      throw AppError.badRequest("Can't remove owner");
    }

    board.members = board.members.filter(m => m.toString() !== userId);
    await Promise.all([
      board.save(),
      Task.updateMany({ board: board._id }, { $pull: { assignees: userId } })
    ]);
    await board.populate('members', 'name email');

    send(res, 200, { board });
  } catch (err) {
    next(err);
  }
};

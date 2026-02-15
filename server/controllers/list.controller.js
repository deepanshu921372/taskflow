const List = require('../models/List');
const Task = require('../models/Task');
const Board = require('../models/Board');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { logActivity } = require('../services/activity.service');

exports.getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ board: req.params.boardId }).sort({ position: 1 });
    ApiResponse.success(res, { lists });
  } catch (error) {
    next(error);
  }
};

exports.createList = async (req, res, next) => {
  try {
    const { title } = req.body;
    const boardId = req.params.boardId;

    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({
      title,
      board: boardId,
      position,
    });

    await logActivity({
      user: req.user._id,
      board: boardId,
      action: 'created',
      entityType: 'list',
      entityId: list._id,
      entityTitle: list.title,
    });

    ApiResponse.created(res, { list });
  } catch (error) {
    next(error);
  }
};

exports.updateList = async (req, res, next) => {
  try {
    const { title, position } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (position !== undefined) updates.position = position;

    const list = await List.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!list) {
      throw AppError.notFound('List not found');
    }

    await logActivity({
      user: req.user._id,
      board: list.board,
      action: 'updated',
      entityType: 'list',
      entityId: list._id,
      entityTitle: list.title,
    });

    ApiResponse.success(res, { list });
  } catch (error) {
    next(error);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      throw AppError.notFound('List not found');
    }

    await Task.deleteMany({ list: list._id });
    await List.findByIdAndDelete(list._id);

    await logActivity({
      user: req.user._id,
      board: list.board,
      action: 'deleted',
      entityType: 'list',
      entityId: list._id,
      entityTitle: list.title,
    });

    ApiResponse.success(res, { message: 'List deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.reorderLists = async (req, res, next) => {
  try {
    const { boardId, listIds } = req.body;

    const updates = listIds.map((id, index) =>
      List.findByIdAndUpdate(id, { position: index })
    );

    await Promise.all(updates);

    const lists = await List.find({ board: boardId }).sort({ position: 1 });

    ApiResponse.success(res, { lists });
  } catch (error) {
    next(error);
  }
};

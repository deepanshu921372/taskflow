const List = require('../models/List');
const Task = require('../models/Task');
const { send } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { logActivity } = require('../services/activity.service');

exports.getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ board: req.params.boardId }).sort('position');
    send(res, 200, { lists });
  } catch (err) {
    next(err);
  }
};

exports.createList = async (req, res, next) => {
  try {
    const { title } = req.body;
    const boardId = req.params.boardId;

    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });

    const list = await List.create({
      title,
      board: boardId,
      position: lastList ? lastList.position + 1 : 0
    });

    logActivity({
      user: req.user._id, board: boardId,
      action: 'created', entityType: 'list',
      entityId: list._id, entityTitle: list.title
    });

    send(res, 201, { list });
  } catch (err) {
    next(err);
  }
};

exports.updateList = async (req, res, next) => {
  try {
    const { title, position } = req.body;

    const list = await List.findByIdAndUpdate(
      req.params.id,
      { ...(title !== undefined && { title }), ...(position !== undefined && { position }) },
      { new: true, runValidators: true }
    );

    if (!list) throw AppError.notFound('List not found');

    logActivity({
      user: req.user._id, board: list.board,
      action: 'updated', entityType: 'list',
      entityId: list._id, entityTitle: list.title
    });

    send(res, 200, { list });
  } catch (err) {
    next(err);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) throw AppError.notFound('List not found');

    // delete tasks first then the list
    await Task.deleteMany({ list: list._id });
    await list.deleteOne();

    logActivity({
      user: req.user._id, board: list.board,
      action: 'deleted', entityType: 'list',
      entityId: list._id, entityTitle: list.title
    });

    send(res, 200, { message: 'List deleted' });
  } catch (err) {
    next(err);
  }
};

exports.reorderLists = async (req, res, next) => {
  try {
    const { boardId, listIds } = req.body;

    await Promise.all(
      listIds.map((id, i) => List.findByIdAndUpdate(id, { position: i }))
    );

    const lists = await List.find({ board: boardId }).sort('position');
    send(res, 200, { lists });
  } catch (err) {
    next(err);
  }
};

const Task = require('../models/Task');
const List = require('../models/List');
const { send, sendPaginated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { logActivity } = require('../services/activity.service');
const { emitTaskCreated, emitTaskUpdated, emitTaskMoved, emitTaskDeleted } = require('../services/socket.service');

exports.getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = { list: req.params.listId };
    if (search) query.$text = { $search: search };

    const [total, tasks] = await Promise.all([
      Task.countDocuments(query),
      Task.find(query)
        .populate('assignees', 'name email')
        .sort('position')
        .skip((page - 1) * limit)
        .limit(+limit)
    ]);

    sendPaginated(res, tasks, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignees', 'name email');
    if (!task) throw AppError.notFound('Task not found');
    send(res, 200, { task });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const listId = req.params.listId;

    const list = await List.findById(listId);
    if (!list) throw AppError.notFound('List not found');

    // get next position
    const lastTask = await Task.findOne({ list: listId }).sort({ position: -1 });

    const task = await Task.create({
      title, description, priority, dueDate,
      list: listId,
      board: list.board,
      position: lastTask ? lastTask.position + 1 : 0
    });

    logActivity({
      user: req.user._id, board: list.board,
      action: 'created', entityType: 'task',
      entityId: task._id, entityTitle: task.title
    });

    emitTaskCreated(list.board.toString(), task);
    send(res, 201, { task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, labels } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate }),
        ...(labels !== undefined && { labels })
      },
      { new: true, runValidators: true }
    ).populate('assignees', 'name email');

    if (!task) throw AppError.notFound('Task not found');

    logActivity({
      user: req.user._id, board: task.board,
      action: 'updated', entityType: 'task',
      entityId: task._id, entityTitle: task.title
    });

    emitTaskUpdated(task.board.toString(), task);
    send(res, 200, { task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw AppError.notFound('Task not found');

    logActivity({
      user: req.user._id, board: task.board,
      action: 'deleted', entityType: 'task',
      entityId: task._id, entityTitle: task.title
    });

    const boardId = task.board.toString();
    const listId = task.list.toString();
    await task.deleteOne();

    emitTaskDeleted(boardId, task._id, listId);
    send(res, 200, { message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

exports.moveTask = async (req, res, next) => {
  try {
    const { targetListId, position } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) throw AppError.notFound('Task not found');

    const targetList = await List.findById(targetListId);
    if (!targetList) throw AppError.notFound('Target list not found');

    const oldListId = task.list;
    task.list = targetListId;
    task.position = position;
    await task.save();

    logActivity({
      user: req.user._id, board: task.board,
      action: 'moved', entityType: 'task',
      entityId: task._id, entityTitle: task.title,
      details: { fromList: oldListId, toList: targetListId }
    });

    await task.populate('assignees', 'name email');
    emitTaskMoved(task.board.toString(), task, oldListId.toString(), targetListId);

    send(res, 200, { task });
  } catch (err) {
    next(err);
  }
};

exports.assignUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) throw AppError.notFound('Task not found');

    if (task.assignees.includes(userId)) {
      throw AppError.conflict('Already assigned');
    }

    task.assignees.push(userId);
    await task.save();
    await task.populate('assignees', 'name email');

    logActivity({
      user: req.user._id, board: task.board,
      action: 'assigned', entityType: 'task',
      entityId: task._id, entityTitle: task.title
    });

    send(res, 200, { task });
  } catch (err) {
    next(err);
  }
};

exports.unassignUser = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw AppError.notFound('Task not found');

    task.assignees = task.assignees.filter(a => a.toString() !== req.params.userId);
    await task.save();
    await task.populate('assignees', 'name email');

    logActivity({
      user: req.user._id, board: task.board,
      action: 'unassigned', entityType: 'task',
      entityId: task._id, entityTitle: task.title
    });

    send(res, 200, { task });
  } catch (err) {
    next(err);
  }
};

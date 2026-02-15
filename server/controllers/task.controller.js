const Task = require('../models/Task');
const List = require('../models/List');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { logActivity } = require('../services/activity.service');

exports.getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const listId = req.params.listId;

    const query = { list: listId };
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignees', 'name email')
      .sort({ position: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    ApiResponse.paginated(res, tasks, page, limit, total);
  } catch (error) {
    next(error);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignees', 'name email');

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    ApiResponse.success(res, { task });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const listId = req.params.listId;

    const list = await List.findById(listId);
    if (!list) {
      throw AppError.notFound('List not found');
    }

    const lastTask = await Task.findOne({ list: listId }).sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      list: listId,
      board: list.board,
      position,
    });

    await logActivity({
      user: req.user._id,
      board: list.board,
      action: 'created',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
    });

    ApiResponse.created(res, { task });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, labels } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (labels !== undefined) updates.labels = labels;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('assignees', 'name email');

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    await logActivity({
      user: req.user._id,
      board: task.board,
      action: 'updated',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
    });

    ApiResponse.success(res, { task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    await logActivity({
      user: req.user._id,
      board: task.board,
      action: 'deleted',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
    });

    await Task.findByIdAndDelete(task._id);

    ApiResponse.success(res, { message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.moveTask = async (req, res, next) => {
  try {
    const { targetListId, position } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    const oldListId = task.list;
    const targetList = await List.findById(targetListId);

    if (!targetList) {
      throw AppError.notFound('Target list not found');
    }

    task.list = targetListId;
    task.position = position;
    await task.save();

    await logActivity({
      user: req.user._id,
      board: task.board,
      action: 'moved',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      details: { fromList: oldListId, toList: targetListId },
    });

    await task.populate('assignees', 'name email');

    ApiResponse.success(res, { task });
  } catch (error) {
    next(error);
  }
};

exports.assignUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (task.assignees.includes(userId)) {
      throw AppError.conflict('User already assigned');
    }

    task.assignees.push(userId);
    await task.save();
    await task.populate('assignees', 'name email');

    await logActivity({
      user: req.user._id,
      board: task.board,
      action: 'assigned',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
    });

    ApiResponse.success(res, { task });
  } catch (error) {
    next(error);
  }
};

exports.unassignUser = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const userId = req.params.userId;

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    task.assignees = task.assignees.filter((a) => a.toString() !== userId);
    await task.save();
    await task.populate('assignees', 'name email');

    await logActivity({
      user: req.user._id,
      board: task.board,
      action: 'unassigned',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
    });

    ApiResponse.success(res, { task });
  } catch (error) {
    next(error);
  }
};

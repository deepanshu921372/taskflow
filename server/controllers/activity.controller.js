const Activity = require('../models/Activity');
const { sendPaginated } = require('../utils/apiResponse');

exports.getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    const boardId = req.params.boardId;

    const query = { board: boardId };
    if (action) query.action = action;

    const [total, activities] = await Promise.all([
      Activity.countDocuments(query),
      Activity.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(+limit)
    ]);

    sendPaginated(res, activities, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

const Activity = require('../models/Activity');
const ApiResponse = require('../utils/apiResponse');

exports.getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    const boardId = req.params.boardId;

    const query = { board: boardId };
    if (action) {
      query.action = action;
    }

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    ApiResponse.paginated(res, activities, page, limit, total);
  } catch (error) {
    next(error);
  }
};

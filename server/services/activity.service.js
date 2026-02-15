const Activity = require('../models/Activity');

const logActivity = async ({ user, board, action, entityType, entityId, entityTitle, details = null }) => {
  try {
    const activity = await Activity.create({
      user,
      board,
      action,
      entityType,
      entityId,
      entityTitle,
      details,
    });

    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };

const express = require('express');
const router = express.Router();

const activityController = require('../controllers/activity.controller');
const auth = require('../middleware/auth');
const boardAccess = require('../middleware/boardAccess');

router.use(auth);

router.get('/boards/:boardId/activities', boardAccess, activityController.getActivities);

module.exports = router;

const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    const user = await User.create({ name, email, password });
    const token = user.generateToken();

    ApiResponse.created(res, { user, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = user.generateToken();

    ApiResponse.success(res, { user, token });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    ApiResponse.success(res, { user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User');
const { send } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw AppError.conflict('Email already registered');

    const user = await User.create({ name, email, password });
    const token = user.generateToken();

    send(res, 201, { user, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw AppError.unauthorized('Invalid credentials');
    }

    send(res, 200, { user, token: user.generateToken() });
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req, res) => {
  send(res, 200, { user: req.user });
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(avatar && { avatar }) },
      { new: true, runValidators: true }
    );
    send(res, 200, { user });
  } catch (err) {
    next(err);
  }
};

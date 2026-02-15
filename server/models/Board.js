const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    background: {
      type: String,
      default: '#1B4F72',
    },
  },
  {
    timestamps: true,
  }
);

boardSchema.index({ owner: 1 });
boardSchema.index({ members: 1 });
boardSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Board', boardSchema);

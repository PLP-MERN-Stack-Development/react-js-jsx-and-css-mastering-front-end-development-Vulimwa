// Commments schema
const Task=require("../models/task")
const User=require("../models/users")
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // must match the registered model name
      required: true,
    },
    message: { 
      type: String,
      required: true,
      trim: true
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

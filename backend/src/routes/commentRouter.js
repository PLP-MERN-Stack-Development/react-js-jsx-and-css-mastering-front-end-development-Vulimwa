const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Task = require("../models/task");
const Comment = require('../models/comment');

// Getting all comments for a task
router.get("/tasks/:taskId/comments", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const taskId = req.params.taskId;

    // Validate taskId
    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Verify task exists
    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
      return res.status(404).json({ message: "Task not found" });
    }

    const skip = (page - 1) * limit;

    // Get comments with pagination
    const [comments, total] = await Promise.all([
      Comment.find({ task_id: taskId })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .populate('author_id', 'userName email'),
      Comment.countDocuments({ task_id: taskId })
    ]);

    res.json({
      comments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalComments: total,
      hasMore: skip + comments.length < total
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: error.message });
  }
});
// Getting one comment by id
router.get("/tasks/:taskId/comments/:commentId", async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    // Validate IDs
    if (!taskId.match(/^[0-9a-fA-F]{24}$/) || !commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      task_id: taskId
    }).populate('author_id', 'userName email');

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Creating a comment
router.post("/tasks/:taskId/comments", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message, author_id } = req.body;

    // Validate request body
    if (!message || !author_id) {
      return res.status(400).json({ 
        message: "Message and author_id are required" 
      });
    }

    // Validate IDs
    if (!taskId.match(/^[0-9a-fA-F]{24}$/) || !author_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Verify task and user exist
    const [taskExists, userExists] = await Promise.all([
      Task.findById(taskId),
      User.findById(author_id)
    ]);

    if (!taskExists) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create and save the comment
    const newComment = new Comment({
      message,
      author_id,
      task_id: taskId
    });

    const savedComment = await newComment.save();
    
    // Populate user information before sending response
    const populatedComment = await savedComment.populate('author_id', 'userName email');
    
    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Updating a comment
router.put("/tasks/:taskId/comments/:commentId", async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { message } = req.body;

    // Validate IDs
    if (!taskId.match(/^[0-9a-fA-F]{24}$/) || !commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Validate request body
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Find comment and verify it belongs to the task
    const existingComment = await Comment.findOne({
      _id: commentId,
      task_id: taskId
    });

    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        message,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).populate('author_id', 'userName email');

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: error.message });
  }
});


// Delete a comment
router.delete('/tasks/:taskId/comments/:commentId', async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    // Validate IDs
    if (!taskId.match(/^[0-9a-fA-F]{24}$/) || !commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Ensure the comment exists and belongs to the task
    const existing = await Comment.findOne({ _id: commentId, task_id: taskId });
    if (!existing) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment successfully deleted', commentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/comment/search', async (req, res) => {
  try {
    const { message } = req.query;
    if (!message) {
      return res.status(400).json({ message: 'Message query parameter is required' });
    }

    const comments = await Comment.find({ message: { $regex: message, $options: 'i' } })
      .populate('author_id', 'userName email')
      .populate('task_id', 'title');

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;

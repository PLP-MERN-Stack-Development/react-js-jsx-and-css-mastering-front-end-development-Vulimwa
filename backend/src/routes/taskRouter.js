const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Task = require("../models/task"); 

// Getting all tasks for a user
router.get("/users/:userId/tasks", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.params.userId;

    // Validate userId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Build filter
    const filter = { assignedTo: userId };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    // Verify user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get tasks with pagination
    const [tasks, total] = await Promise.all([
      Task.find(filter)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ dueDate: 1 })
          .populate('assignedTo', 'userName email'),
      Task.countDocuments(filter)
    ]);

    res.json({
      tasks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
      hasMore: skip + tasks.length < total
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/tasks/search', async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ message: 'Title query parameter is required' });
    }

    const tasks = await Task.find({ title: { $regex: title, $options: 'i' } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Getting one task by id
router.get("/users/:userId/tasks/:taskId", async (req, res) => {
  try {
    const tasks = await Task.findById(req.params.taskId);
    if (!tasks) return res.status(404).json({ message: "Task not found" });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Creating a task
router.post("/users/:userId/tasks", async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is required" });
    }

    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.params.userId;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        message: "Title and description are required" 
      });
    }

    // Validate userId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: "Invalid user ID format" 
      });
    }

    // Create new task
    const taskData = new Task({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || new Date(),
      assignedTo: userId,
      comments: []
    });

    const savedTask = await taskData.save();
    const populatedTask = await savedTask.populate('assignedTo', 'userName email');
    
    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Updating a task
router.put("/users/:userId/tasks/:taskId", async (req, res) => {
  try {
    const { userId, taskId } = req.params;

    // Validate IDs
    if (!userId.match(/^[0-9a-fA-F]{24}$/) || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find task and verify ownership
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (existingTask.assignedTo.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Update the task
    const { comments, ...updateData } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { ...updateData, lastUpdated: new Date() },
      { 
        new: true,
        runValidators: true
      }
    ).populate('assignedTo', 'userName email')
     .populate({
       path: 'comments',
       select: 'message author_id createdAt',
       populate: {
         path: 'author_id',
         select: 'userName email'
       }
     });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: error.message });
  }
});


// Delete a task
router.delete('/users/:userId/tasks/:taskId', async (req, res) => {
    try {
        const { userId, taskId } = req.params;

        // Validate IDs
        if (!userId.match(/^[0-9a-fA-F]{24}$/) || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Find task and verify ownership
        const existingTask = await Task.findById(taskId);
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        if (existingTask.assignedTo.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }

        // Delete the task
        await Task.findByIdAndDelete(taskId);
        res.json({ 
            message: 'Task successfully deleted',
            taskId: taskId
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;

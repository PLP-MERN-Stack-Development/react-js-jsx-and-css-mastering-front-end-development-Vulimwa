// Task Schema
const mongoose=require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed", "blocked"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "high",
    },
    dueDate: { type: Date, default: Date.now },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
  },
  { timestamps: true }
);

const Task=mongoose.model('Task',taskSchema);
module.exports=Task
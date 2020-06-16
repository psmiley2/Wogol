const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "",
    required: true,
  },
  description: {
    type: String,
    default: "",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("TaskSchema", TaskSchema, "Task");

module.exports = {
  TaskSchema,
  Task,
};

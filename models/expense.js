const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Groceries",
      "Transportation",
      "Utilities",
      "Entertainment",
      "Healthcare",
      "Other",
    ], // Define the categories as an enumeration
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Default to the current date and time
  },
  amount: {
    type: Number,
    required: true,
  },
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
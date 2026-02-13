const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: Number,
  type: String,
  category: String,
  date: String,
  note: String
});

module.exports = mongoose.model("Expense", ExpenseSchema);

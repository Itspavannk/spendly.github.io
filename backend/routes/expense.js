const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ADD TRANSACTION
router.post("/", authMiddleware, async (req, res) => {
  const expense = new Expense({
    userId: req.user.userId,
    ...req.body
  });

  await expense.save();
  res.json(expense);

});

// GET USER TRANSACTIONS
router.get("/", authMiddleware, async (req, res) => {
  const expenses = await Expense.find({ userId: req.user.userId });
  res.json(expenses);
});

// DELETE TRANSACTION
router.delete("/:id", authMiddleware, async (req, res) => {
  await Expense.deleteOne({
    _id: req.params.id,
    userId: req.user.userId
  });

  res.json({ message: "Deleted" });
});

module.exports = router;

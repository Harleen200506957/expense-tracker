const Joi = require("joi");
const express = require("express");
const Expense = require("../models/expense"); // Import the Expense model

// Joi schema for validating the expense data
const expenseSchema = Joi.object({
  category: Joi.string()
    .valid(
      "Groceries",
      "Transportation",
      "Utilities",
      "Entertainment",
      "Healthcare",
      "Other"
    )
    .required(),
  name: Joi.string().required(),
  date: Joi.date().required(),
  amount: Joi.number().required().positive(),
});


exports.getExpenses = async (req, res) => {
    const userId = req.user._id;

    try {
      // Find all expenses of the current user
      const expenses = await Expense.find({ user_id: userId });
  
      res.render("expenses", {
        pageTitle: "Expenses",
        expenses,
        isLoggedIn: true,
      });
    } catch (error) {
      console.error("Error while fetching expenses:", error);
      return res.status(500).send("Internal server error");
    }    
}

// Controller for handling both POST and GET requests for the '/addExpense' route
exports.addExpense = async (req, res) => {
  if (req.method === "POST") {
    try {
      // Validate the expense data using Joi
      const { error, value } = expenseSchema.validate(req.body, {
        abortEarly: false, // Include all validation errors
      });

      if (error) {
        // If validation fails, re-render the page with the validation errors
        return res.render("addExpense", {
          pageTitle: "Add Expense",
          categories: [
            "Groceries",
            "Transportation",
            "Utilities",
            "Entertainment",
            "Healthcare",
            "Other",
          ],
          errors: error.details,
          isLoggedIn: true,
        });
      }

      // If validation passes, create a new expense using the validated data
      const expense = new Expense({
        category: value.category,
        name: value.name,
        date: value.date,
        amount: value.amount,
        user_id: req.user._id,
      });

      // Save the expense to the database
      await expense.save();

      // Redirect to the home page after successful expense creation
      return res.redirect("/expense");
    } catch (error) {
      console.error("Error while adding expense:", error);
      // Handle any other errors that may occur during expense creation
      return res.status(500).send("Internal Server Error");
    }
  } else {
    // Handle GET request to render the 'addExpense' page
    res.render("addExpense", {
      pageTitle: "Add Expense",
      categories: [
        "Groceries",
        "Transportation",
        "Utilities",
        "Entertainment",
        "Healthcare",
        "Other",
      ],
      errors: [], // Empty errors array for rendering the page initially
      isLoggedIn: true,
    });
  }
};

exports.editExpense = async (req, res) => {
  const expenseId = req.params.id;

  if (req.method === "POST") {
    try {
      // Validate the expense data using Joi
      const { error, value } = expenseSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        // If validation fails, re-render the page with the validation errors
        return res.render("editExpense", {
          pageTitle: "Edit Expense",
          categories: [
            "Groceries",
            "Transportation",
            "Utilities",
            "Entertainment",
            "Healthcare",
            "Other",
          ],
          expense: value, // Pass the edited expense data back to the template
          errors: error.details,
            isLoggedIn: true,
        });
      }

      // If validation passes, update the expense using the validated data
      const updatedExpense = {
        category: value.category,
        name: value.name,
        date: value.date,
        amount: value.amount,
      };
      await Expense.findByIdAndUpdate(expenseId, updatedExpense);

      // Redirect to the home page after successful expense update
      return res.redirect("/expense");
    } catch (error) {
      console.error("Error while updating expense:", error);
      // Handle any other errors that may occur during expense update
      return res.status(500).send("Internal Server Error");
    }
  } else {
    try {
      // Fetch the expense data from the database based on the expenseId
      const expense = await Expense.findById(expenseId);

      if (!expense) {
        // If expense is not found, return a 404 error
        return res.status(404).send("Expense not found");
      }
      // Handle GET request to render the 'editExpense' page with the expense data
      res.render("editExpense", {
        pageTitle: "Edit Expense",
        categories: [
          "Groceries",
          "Transportation",
          "Utilities",
          "Entertainment",
          "Healthcare",
          "Other",
        ],
        expense: expense, // Pass the expense data to the template
        errors: [], // Empty errors array for rendering the page initially
      isLoggedIn: true,

      });
    } catch (error) {
      console.error("Error while fetching expense data:", error);
      // Handle any other errors that may occur during expense data fetching
      return res.status(500).send("Internal Server Error");
    }
  }
};

exports.deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user._id;
  if (req.method === "POST") {
    try {
      // Check if the user owns the expense before deleting
      const expense = await Expense.findOne({ _id: expenseId, user_id: userId });

      if (!expense) {
        return res
          .status(404)
          .send("Expense not found or not owned by the user.");
      }

      // Delete the expense
      await Expense.findByIdAndDelete(expenseId);
      return res.redirect("/expense"); // Redirect to the home page after successful deletion
    } catch (error) {
      console.error("Error while deleting expense:", error);
      return res.status(500).send("Internal server error");
    }
  }

  res.render("deleteExpense", {
    pageTitle: "Delete Expense",
    expenseId,
    isLoggedIn: true,
  });
};

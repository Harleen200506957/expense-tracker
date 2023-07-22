const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expense');

router.get('/', expenseController.getExpenses);
router.use('/add',  expenseController.addExpense);
router.use('/edit/:id', expenseController.editExpense);
router.use('/delete/:id', expenseController.deleteExpense);


module.exports = router;
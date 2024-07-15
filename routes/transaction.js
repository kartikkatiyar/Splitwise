const express = require("express");
const transactionRoutes = express.Router();
const bodyParser = require("body-parser");
const TransactionController = require("../controllers/transaction");

transactionRoutes.use(bodyParser.urlencoded({ extended: false }));
transactionRoutes.use(bodyParser.json());

transactionRoutes.get("/get/:transactionId", TransactionController.getTransaction);
transactionRoutes.get("/get/:partnerId", TransactionController.getTransactions);
transactionRoutes.get("/getAll", TransactionController.getAllTransactions);
transactionRoutes.post("/create", TransactionController.createTransaction);
transactionRoutes.patch("/edit", TransactionController.editTransactions);
transactionRoutes.delete("/delete", TransactionController.deleteTransaction);
transactionRoutes.get("/balance", TransactionController.calculateBalance);

module.exports = { transactionRoutes };

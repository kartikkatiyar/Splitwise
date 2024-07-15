const { prisma } = require("../db/prisma");
const { Validator } = require("../helpers/validator");

class TransactionController {
  static async getTransaction(req, res) {
    if (req.verified === false) {
      return res.status(403).send(req.msg);
    }

    const { transactionId } = req.params;

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      return res.status(200).json(transaction);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error" });
    }
  }

  static async getTransactions(req, res) {
    if (req.verified === false) {
      return res.status(403).send(req.msg);
    }

    const { partnerId } = req.params;
    const { userId } = req.id;

    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            {
              giver: partnerId,
              receiver: userId,
            },
            {
              giver: userId,
              receiver: partnerId,
            },
          ],
        },
      });

      return res.status(200).json(transactions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error" });
    }
  }

  static async getAllTransactions(req, res) {
    if (req.verified === false) {
      return res.status(403).send(req.msg);
    }

    const { userId } = req.id;

    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            {
              receiver: userId,
            },
            {
              giver: userId,
            },
          ],
        },
      });

      return res.status(200).json(transactions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error" });
    }
  }

  static async createTransaction(req, res) {
    if (req.verified === false) {
      return res.status(403).send(req.msg);
    }
    const {
      amount,
      description,
      giverId,
      receiverId,
      settled = false,
    } = req.body;
    const { isInputValid, msg: inputValidationErrorMsg } =
      Validator.inputValidation({ amount, giverId, receiverId });
    if (!isInputValid) {
      return res.status(400).json({ msg: inputValidationErrorMsg });
    }
    try {
      await prisma.transaction.create({
        data: {
          amount: Number(amount),
          description,
          giverId,
          receiverId,
          settled,
        },
      });
      return res.status(200).json({ msg: "Transaction created successfully!" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }

  static async editTransactions(req, res) {
    if (req.verified === false) {
      return res.status(403).send(req.msg);
    }
    const { transactionId, ...updates } = req.body;
    const { isInputValid, msg: inputValidationErrorMsg } =
      Validator.inputValidation({ transactionId });
    if (!isInputValid) {
      return res.status(400).json({ msg: inputValidationErrorMsg });
    }
    try {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { ...updates },
      });
      return res.status(200).json({ msg: "Transaction updated Successfully!" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }

  static async deleteTransaction(req, res) {
    if (req.verified === false) {
      return res.status(403).send(req.msg);
    }
    const { transactionIds } = req.body;
    if (!Array.isArray(transactionIds)) {
      return res
        .status(400)
        .json({ msg: "tansactionIds is not a valid array" });
    }
    try {
      await prisma.transaction.deleteMany({
        where: {
          id: {
            in: transactionIds,
          },
        },
      });
      return res
        .status(200)
        .json({ msg: "Transactions deleted successfully!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }

  static async calculateBalance(req, res) {
    if (req.verified === false) {
      return res.status(403).send(req.msg);
    }
    const { userId } = req.id;

    try {
      // Calculate total amount given by the user
      const totalGiven = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          giverId: userId,
          settled: false,
        },
      });

      // Calculate total amount received by the user
      const totalReceived = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          receiverId: userId,
          settled: false,
        },
      });

      // Calculate balance remaining
      const balanceRemaining =
        (totalReceived._sum.amount || 0) - (totalGiven._sum.amount || 0);

      return res.status(200).json({ balance: balanceRemaining });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
}

module.exports = TransactionController;

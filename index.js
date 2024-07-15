const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const { authRoutes } = require("./routes/auth");
// const { taskRoutes } = require("./routes/task");
// const { verifyToken } = require("./middleware/verifyToken");
const { prisma } = require("./db/prisma");
const { transactionRoutes } = require("./routes/transaction");
const { verifyToken } = require("./middlewares/verifyToken");

const routes = express.Router();
dotenv.config();
const app = express();

app.use(cors());
app.use(routes);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function main() {
  try {
    await prisma.$connect();
    app.listen(process.env.PORT || 3001, () => {
      console.log(`Server running on port ${process.env.PORT || 3001}`);
    });
    app.get("/", (req, res) => {
      res.status(200).send("Welcome");
    });
    app.use("/api/auth", authRoutes);
    app.use("/api/transactions", verifyToken, transactionRoutes);
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

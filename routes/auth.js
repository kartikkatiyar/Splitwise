const express = require("express");
const authRoutes = express.Router();
const bodyParser = require("body-parser");
const { UserController } = require("../controllers/auth");

authRoutes.use(bodyParser.urlencoded({ extended: false }));
authRoutes.use(bodyParser.json());

authRoutes.post("/login", UserController.loginUser);
authRoutes.post("/signup", UserController.registerUser);

module.exports = { authRoutes };

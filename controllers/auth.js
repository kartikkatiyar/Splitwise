const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../db/prisma");
const { Validator } = require("../helpers/validator");

class UserController {
  static async registerUser(req, res) {
    const { fullname, email, password } = req.body;

    const { isInputValid, msg: inputValidationErrorMsg } =
      Validator.inputValidation({
        fullname,
        email,
        password,
      });
    if (!isInputValid) {
      return res.status(400).json({ msg: inputValidationErrorMsg });
    }
    const { msg, isNewUserEntry } = await Validator.getUser(email, {
      attempt: "signup",
    });
    if (!isNewUserEntry) {
      return res.status(400).json({ msg });
    }

    try {
      await prisma.user.create({
        data: {
          fullname,
          email,
          password: bcrypt.hashSync(password.toString(), 4),
        },
      });
      return res.status(200).json({ msg: "Account created Successfully!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  }
  static async loginUser(req, res) {
    const { email, password } = req.body;
    const { isInputValid, msg: inputValidationMessage } =
      Validator.inputValidation({
        email,
        password,
      });
    if (!isInputValid) {
      return res.status(400).json({ msg: inputValidationMessage });
    }
    try {
      const { userData, msg, isNewUserEntry } = await Validator.getUser(email, {
        attempt: "logIn",
      });
      if (isNewUserEntry) {
        return res.status(400).json({ msg });
      }
      const isPasswordValid = bcrypt.compareSync(
        password.toString(),
        userData.password.toString()
      );
      if (!isPasswordValid) {
        return res.status(400).json({ msg: "invalid password" });
      }
      const token = jwt.sign({ id: userData._id }, process.env.API_SECRET, {
        expiresIn: 86400,
      });
      userData.password = null;

      return res.status(200).json({
        userData,
        msg: "login successful",
        accessToken: token,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
}

module.exports = { UserController };

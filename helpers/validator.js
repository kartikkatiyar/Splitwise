const { prisma } = require("../db/prisma");

class Validator {
  constructor() {}
  static inputValidation(inputs) {
    const arrayOfInputs = Object.keys(inputs);
    for (let i = 0; i < arrayOfInputs.length; i++) {
      const inputKey = arrayOfInputs[i];
      const input = inputs[inputKey];
      if (!input) {
        return {
          isInputValid: false,
          msg: `${inputKey} field cannot be empty`,
        };
      }
      if (inputKey === "email") {
        if (
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input) == false
        ) {
          return {
            isInputValid: false,
            msg: "email address entered is not valid",
          };
        }
      }
    }
    return {
      isInputValid: true,
    };
  }
  static async getUser(email, { attempt }) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      if (attempt === "logIn") {
        return {
          isNewUserEntry: false,
          userData: user,
          msg: "user exists, we are good to login ",
        };
      } else if (attempt === "signup") {
        return {
          isNewUserEntry: false,
          userData: user,
          msg: "user with this email already exists, try signing in with some other email",
        };
      }
    } else {
      if (attempt === "logIn") {
        return {
          isNewUserEntry: true,
          userData: null,
          msg: "email not found, try signing-up first",
        };
      } else if (attempt === "signup") {
        return {
          isNewUserEntry: true,
          userData: user,
          msg: "email not in the database,we are good to signup",
        };
      }
    }
  }
}

module.exports = { Validator };

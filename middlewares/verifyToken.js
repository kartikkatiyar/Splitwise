const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token = req.header("authorization");

  if (token && token.split(" ")[0] === "JWT") {
    jwt.verify(token.split(" ")[1], process.env.API_SECRET, (error, decode) => {
      if (error) {
        req.verified = false;
        req.msg = "invalid JWT token";
        next();
        return;
      }
      req.id = decode.id;
      req.verified = true;
      next();
    });
  } else {
    req.verified = false;
    req.msg = "Authorization header not found";
    next();
  }
};

module.exports = { verifyToken };
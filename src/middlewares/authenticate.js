const JWT = require("jsonwebtoken");
const httpStatus = require("http-status");

const authenticateToken = (req, res, next) => {
  const token = req.headers?.token;

  if (!token)
    return res.status(httpStatus.UNAUTHORIZED).send({
      message:
        "You should login before you do this action. Please login first.",
    });
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    if (err) return res.status(httpStatus.FORBIDDEN).send(err);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;

const hs = require("http-status");
const uuid = require("uuid");

const { list, insert, findOne, update } = require("../services/Users");
const {
  passwordToHash,
  generateJWTAccessToken,
  generateJWTRefreshToken,
} = require("../scripts/utils/helper");
const { updateUser } = require("../validations/Users");
const eventEmitter = require("../scripts/events/eventEmitter");

const index = (req, res) => {
  list()
    .then((userList) => {
      if (!userList)
        res
          .status(hs.INTERNAL_SERVER_ERROR)
          .send({ error: "There is a problem in -> index method" });
      res.status(hs.OK).send(userList);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const create = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  insert(req.body)
    .then((createdUser) => {
      if (!createdUser)
        res
          .status(hs.INTERNAL_SERVER_ERROR)
          .send({ error: "There is a problem in -> create method" });
      res.status(hs.OK).send(createdUser);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const login = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  findOne(req.body)
    .then((user) => {
      if (!user)
        return res
          .status(hs.NOT_FOUND)
          .send({ message: "This person does not exist" });
      user = {
        ...user.toObject(),
        tokens: {
          access_token: generateJWTAccessToken(user),
          refresh_token: generateJWTRefreshToken(user),
        },
      };
      delete user.password;
      res.status(hs.OK).send(user);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const resetPassword = (req, res) => {
  const newPassword = uuid.v4()?.split("-")[0] || `usr-${new Date().getTime()}`;

  update({ email: req.body.email }, { password: passwordToHash(newPassword) })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res
          .status(hs.NOT_FOUND)
          .send({ message: "This person does not exist" });
      }
      eventEmitter.emit("send_email", {
        to: updatedUser.email,
        subject: "Password reset",
        html: `<p>Don't forget to change your password after you login. Your new password is: ${newPassword}</p>`,
      });
      res
        .status(hs.OK)
        .send({ message: "Please check your mailbox for your new password!" });
    })
    .catch(() =>
      res
        .status(hs.INTERNAL_SERVER_ERROR)
        .send({ error: "There is a problem in -> resetPassword method" })
    );
};

module.exports = {
  index,
  create,
  login,
  resetPassword,
};

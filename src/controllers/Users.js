const hs = require("http-status");
const { list, insert, findOne } = require("../services/Users");
const {
  passwordToHash,
  generateJWTAccessToken,
  generateJWTRefreshToken,
} = require("../scripts/utils/helper");

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

module.exports = {
  index,
  create,
  login,
};

const hs = require("http-status");
const path = require("path");

const { list, insert, findOne, updateDoc } = require("../services/Products");
const { checkSecureFile } = require("../scripts/utils/helper");

const index = (req, res) => {
  list()
    .then((itemList) => {
      if (!itemList) {
        res
          .status(hs.INTERNAL_SERVER_ERROR)
          .send({ error: "There is a problem on -> index method" });
      }
      res.status(hs.OK).send(itemList);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const create = (req, res) => {
  req.body.user_id = req.user;
  insert(req.body)
    .then((createdDoc) => {
      if (!createdDoc) {
        res
          .status(hs.INTERNAL_SERVER_ERROR)
          .send({ error: "There is a problem on -> create method" });
      }
      res.status(hs.OK).send(createdDoc);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const update = (req, res) => {
  if (!req.params.id)
    return res
      .status(hs.BAD_REQUEST)
      .send({ message: "There are some mis-information on -> update method" });
  updateDoc(req.params.id, req.body)
    .then((updatedDoc) => {
      if (!updatedDoc)
        return res
          .status(hs.NOT_FOUND)
          .send({ message: "This item does not exist" });
      res.status(hs.OK).send(updatedDoc);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const addComment = (req, res) => {
  if (!req.params.id)
    return res.status(hs.BAD_REQUEST).send({ message: "Mis-information" });
  findOne({ _id: req.params.id }).then((mainProduct) => {
    if (!mainProduct)
      return res
        .status(hs.NOT_FOUND)
        .send({ message: "This item does not exist" });
    const comment = {
      ...req.body,
      created_at: new Date(),
      user_id: req.user,
    };
    mainProduct.comments.push(comment);
    updateDoc(req.params.id, mainProduct)
      .then((updatedDoc) => {
        if (!updatedDoc)
          return res
            .status(hs.NOT_FOUND)
            .send({ message: "Böyle bir ürün bulunmamaktadır" });
        res.status(hs.OK).send(updatedDoc);
      })
      .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
  });
};

const addMedia = (req, res) => {
  if (
    !req.params.id ||
    !req.files?.file ||
    !checkSecureFile(req?.files?.file?.mimetype)
  )
    return res.status(hs.BAD_REQUEST).send({ message: "Mis-information" });
  findOne({ _id: req.params.id }).then((mainProduct) => {
    if (!mainProduct)
      return res
        .status(hs.NOT_FOUND)
        .send({ message: "This item does not exist" });

    const extension = path.extname(req.files.file.name);
    const fileName = `${mainProduct._id?.toString()}${extension}`;
    const folderPath = path.join(
      __dirname,
      "../",
      "uploads/products",
      fileName
    );

    req.files.file.mv(folderPath, function (err) {
      if (err) return res.status(hs.INTERNAL_SERVER_ERROR).send(err);
      mainProduct.media = fileName;
      updateDoc(req.params.id, mainProduct)
        .then((updatedDoc) => {
          if (!updatedDoc)
            return res
              .status(hs.NOT_FOUND)
              .send({ message: "Böyle bir ürün bulunmamaktadır" });
          res.status(hs.OK).send(updatedDoc);
        })
        .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
    });
  });
};

module.exports = {
  index,
  create,
  update,
  addComment,
  addMedia,
};

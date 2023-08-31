const express = require("express");
const multer = require("multer");
const router = express.Router();
const Post = require("../models/post");
const { title } = require("process");

const MINE_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: (re, file, cb) => {
    const isValid = MINE_TYPE[file.mimetype];
    let err = new Error("Invalid Mine Type file");
    if (isValid) {
      err = null;
    }
    cb(err, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MINE_TYPE[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});
// router.post("/api/posts", (req, res, next) => {
//   // const post = req.body
//   const post = new Post({
//     title: req.body.title,
//     content: req.body.content,
//   });
//   console.log(post);
//   post.save();
//   res.status(201).json({
//     message: "Post added successfully",
//   });
// });
// or

router.post(
  "",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
    });
    console.log(post);
    post.save().then((createdPost) => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          id: createdPost._id,
          title: createdPost.title,
          content: createdPost.content,
          // imagePath: createdPost.imagePath,
          imagePath: url + "/images/" + req.file.filename,
        },
      });
    });
  }
);
router.get("", (req, res, next) => {
  // const posts = [
  //     {id:'svsv', title:'First', content:'c1'},
  //     {id:'bbee', title:'Second', content:'c2'},
  //     {id:'ksjdv', title:'Third', content:'c3'},
  //     {id:'eoigje', title:'Fourth', content:'c4'}
  // ]
  // res.json(posts)
  const pageSize = +req.query.pageSize;
  const currentPage = +req.params.page;
  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Posts fetched successfully form server",
        posts: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/:id", (req, res, next) => {
  Post.findById({ _id: req.params.id }).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found in this id" });
    }
  });
});
router.delete("/:id", (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({ _id: req.params.id })
    .then((result) => {
      console.log(`ID: ${req.params.id} deleted now`);
      console.log(result);
      res.status(200).json({ message: "Post deleted" });
    })
    .catch((err) => {
      console.log(err.message);
    });
});
router.put(
  "/:id",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const updatePost = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
    });
    Post.updateOne({ _id: req.params.id }, updatePost)
      .then((result) => {
        console.log(result);
        res.status(200).json({ message: "Updated post" });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);
module.exports = router;

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const postRoute = require("./routes/posts");
const app = express();
mongoose
  .connect("mongodb://localhost:27017/angularNodeDB")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(() => {
    console.log("DB did not cannect");
  });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static(path.join("backend/images")));

// Enable CORS middleware
app.use((req, res, next) => {
  // Set the CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );

  // Continue to the next middleware
  next();
});

app.use("/api/posts", postRoute);

module.exports = app;

const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
<<<<<<< HEAD:app.ts
=======

>>>>>>> b28d870d693c4775fda77370be306a88fc704fea:app.js
dotenv.config();
const app = express();

mongoose.connect(process.env.DB_CONNECT);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database successfuly"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const postsRouter = require("./routes/posts_route");

app.use("/posts", postsRouter);


const commentsRouter = require("./routes/comments_route");

app.use("/comments", commentsRouter);

const usersRouter = require("./routes/users_route");

app.use("/users", usersRouter);

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});

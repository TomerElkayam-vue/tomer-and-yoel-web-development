import appPromise from "./app";

appPromise.then((app) =>
  app.listen(process.env.PORT, () => {
    console.log(
      `tomer and yoel web development listening at http://localhost:${process.env.PORT}`
    );
  })
);

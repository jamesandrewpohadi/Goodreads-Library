var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// var log = (req, res, next) => {
//   console.log(1);

//   const cleanup = () => {
//     res.removeListener("finish", logFn);
//     res.removeListener("close", abortFn);
//     res.removeListener("error", errorFn);
//   };

//   const logFn = () => {
//     // cleanup();
//     console.log(
//       `${res.statusCode} ${res.statusMessage}; ${res.get("Content-Length") ||
//         0}b sent`
//     );
//   };

//   const abortFn = () => {
//     // cleanup();
//     console.log("Request aborted by the client");
//   };

//   const errorFn = err => {
//     // cleanup();
//     console.log(`Request pipeline error: ${err}`);
//   };
//   res.on("finish", logFn); // successful pipeline (regardless of its response)
//   res.on("close", abortFn); // aborted pipeline
//   res.on("error", errorFn);
//   req.on("pipe", () => {
//     console.log(1);
//   });
//   next();
// };

// app.use(log);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use(express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

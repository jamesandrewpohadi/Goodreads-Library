var express = require("express");
var mysql = require("mysql");
var router = express.Router();
var book_id = [];

<<<<<<< HEAD
var fs = require("fs");
var instance = JSON.parse(fs.readFileSync("instance.json", "utf8"));
=======
>>>>>>> 4df0db66e667f258276ddf1de59b0bd40351101a
const {login, register, validate, generate} = require('../models/user.model');
const config = require('config');

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://" + instance["mongodb-server"] + ":27017/";
// var url = "mongodb://localhost:27017/";

var ms = mysql.createConnection({
  host: instance["mysql-server"],
  //host: "localhost",
  user: "root",
  password: "mysql",
  database: "goodreads"
});

var log = (req, res, next) => {
  res.on("finish", function() {
    var myobj = {
      statusCode: res.statusCode,
      method: req.method,
      date: new Date(),
      url: req.url,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    };
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      dbo = db.db("goodreads");
      dbo.collection("logs").insertOne(myobj, function(err, res) {
        if (err) throw err;
        db.close();
      });
    });
  });
  next();
};

router.use(log);

/* GET home page. */
router.get("/", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("goodreads");
    dbo
      .collection("meta_Kindle_Store")
      .find({})
      .limit(120)
      .toArray(function(err, result) {
        // result.forEach((book, i) => {
        //   ms.query(
        //     "select overall as review,count(reviewerID) as cnt from kindle_reviews where asin='" +
        //       book.asin +
        //       "' group by overall",
        //     function(err, ratings) {
        //       if (err) throw err;
        //       book.ratings = ratings;
        //       if (i == result.length - 1) {
        //         res.render("index", {
        //           data: { title: "goodreads", books: result }
        //         });
        //       }
        //     }
        //   );
        // });
        res.render("index", {
          data: { title: "goodreads", books: result }
        });
        db.close();
      });
  });
});

router.get("/book/:id", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("goodreads");
    dbo
      .collection("meta_Kindle_Store")
      .find({ asin: req.params.id })
      .toArray(function(err, book) {
        ms.query(
          "select * from kindle_reviews where asin = ? order by unixReviewTime desc",
          [req.params.id],
          function(err, reviews) {
            if (err) throw err;
            res.render("book_review", {
              data: { book: book[0], reviews: reviews }
            });
          }
        );
        db.close();
      });
  });
});

router.get("/user/:id", function(req, res, next) {
  ms.query(
    "select * from kindle_reviews where reviewerID = ?",
    [req.params.id],
    function(err, user_data) {
      var keyCount = Object.keys(user_data).length;

      for (var i = 0; i < keyCount; i++) {
        book_id.push(user_data[i]["asin"]);
      }
      if (err) throw err;
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        dbo = db.db("goodreads");
        dbo
          .collection("meta_Kindle_Store")
          .find({ asin: { $in: book_id } })
          .limit(20)
          .toArray(function(err, book_data) {
            res.render("user", {
              data: {
                user_data: user_data,
                book_data: book_data,
                title: "goodreads"
              }
            });
            // console.log(user_data);
          });

        db.close();
      });
    }
  );
});

// router.post("/login", function(req, res, next) {
//   res.render("index");
//   // login(req.body.email)
//   console.log(req.body.email);
// });
<<<<<<< HEAD

router.get("/logs", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("goodreads");
    dbo
      .collection("logs")
      .find()
      .sort({date: -1})
      .limit(100)
      .toArray(function(err, result) {
        res.render("logs", {
          data: {logs: result }
        });
        db.close();
=======

router.post("/signup", function(req, res, next) {
  email = req.body["email"];
  name = req.body["name1"] + req.body["name2"];
  password = req.body["psw-final"];
  register(email, name, password, function({error,suc}){
    console.log(name);
    if (error){
      // res.status(400).send(error);
      console.log(error);
    }
    else{
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        dbo = db.db("goodreads");
        dbo
          .collection("meta_Kindle_Store")
          .find({})
          .limit(20)
          .toArray(function(err, result) {
            res.render("index", { data: { title: "goodreads", books: result } });
            // console.log(result);
            db.close();
          });
      });
    }
  });
  // console.log(email);

  
  console.log("Yooooooo");
});

router.post("/login", function(req, res, next) {
  email = req.body["email"];
  password = req.body["psw"];
  login(email,password, function({error,suc}){
    if (error){
      // res.status(400).send(error);
      console.log(error);
    }
    else{
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        dbo = db.db("goodreads");
        dbo
          .collection("meta_Kindle_Store")
          .find({})
          .limit(20)
          .toArray(function(err, result) {
            res.render("index", { data: { title: "goodreads", books: result } });
            // console.log(result);
            db.close();
          });
>>>>>>> 4df0db66e667f258276ddf1de59b0bd40351101a
      });
    }
  });
<<<<<<< HEAD
});

router.post("/logindetails", function(req, res, next) {
  uname = req.body["uname"];
  console.log(uname);});
router.post("/signup", function(req, res, next) {
  email = req.body["email"];
  name = req.body["name1"] + req.body["name2"];
  password = req.body["psw-final"];
  register(email, name, password, function({error,suc}){
    console.log(name);
    if (error){
      // res.status(400).send(error);
      console.log(error);
    }
    else{
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        dbo = db.db("goodreads");
        dbo
          .collection("meta_Kindle_Store")
          .find({})
          .limit(20)
          .toArray(function(err, result) {
            res.render("index", { data: { title: "goodreads", books: result } });
            // console.log(result);
            db.close();
          });
      });
    }
  });
  // console.log(email);

  
  console.log("Yooooooo");
});

router.post("/login", function(req, res, next) {
  email = req.body["email"];
  password = req.body["psw"];
  login(email,password, function({error,suc}){
    if (error){
      // res.status(400).send(error);
      console.log(error);
    }
    else{
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        dbo = db.db("goodreads");
        dbo
          .collection("meta_Kindle_Store")
          .find({})
          .limit(20)
          .toArray(function(err, result) {
            res.render("index", { data: { title: "goodreads", books: result } });
            // console.log(result);
            db.close();
          });
      });
    }
  });
=======
>>>>>>> 4df0db66e667f258276ddf1de59b0bd40351101a
  // console.log(email);

  
  console.log("Yooooooo");
});

router.post("/search", function(req, res, next) {
  var book_id = req.body.book_id;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("goodreads");
    dbo
      .collection("meta_Kindle_Store")
      .find({ asin: book_id })
      .toArray(function(err, book) {
        if (book.length == 0) {
          res.render("book_review", {
            data: { err: "Book Not found!" }
          });
        }
        ms.query(
          "select * from kindle_reviews where asin = ?",
          [book_id],
          function(err, reviews) {
            if (err) throw err;
            res.render("book_review", {
              data: { book: book[0], reviews: reviews }
            });
          }
        );
        db.close();
      });
  });
});

router.post("/addreview", function(req, res, next) {
  // console.log(req.body);
});

module.exports = router;

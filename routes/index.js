var express = require("express");
var mysql = require("mysql");
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
// var url = "mongodb://35.161.233.181:27017/";
var url = "mongodb://localhost:27017/";

var ms = mysql.createConnection({
  // host: "18.210.39.176",
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "goodreads"
});

/* GET home page. */
router.get("/", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("goodreads");
    dbo
      .collection("meta_Kindle_Store")
      .find({})
      .limit(20)
      .toArray(function(err, result) {
        res.render("index", { data: { title: "goodreads", books: result } });
        console.log(result);
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
          "select * from kindle_reviews where asin = '" + req.params.id + "'",
          function(err, reviews) {
            if (err) throw err;
            // console.log("reviews", reviews);
            res.render("book_review", {
              data: { book: book[0], reviews: reviews }
            });
          }
        );
        db.close();
      });
  });
});

module.exports = router;

var express = require("express");
var mysql = require("mysql");
var router = express.Router();
var book_id = [];

var fs = require("fs");
var instance = JSON.parse(fs.readFileSync("instance.json", "utf8"));

var MongoClient = require("mongodb").MongoClient;
// var url = "mongodb://" + instance["mongodb-server"] + ":27017/";
var url = "mongodb://localhost:27017/";

var ms = mysql.createConnection({
  host: instance["mysql-server"],
  //host: "localhost",
  user: "root",
  password: "mysql",
  database: "goodreads"
});

var log = (req, res, next) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("goodreads");
    res.on("finish", function() {
      var myobj = {
        statusCode: res.statusCode,
        method: req.method,
        date: new Date(),
        url: req.url,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
      };
      dbo.collection("logs").insertOne(myobj, function(err, res) {
        if (err) throw err;
        db.close();
      });
    });
    next();
  });
};

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
            console.log(user_data);
          });

        db.close();
      });
    }
  );
});

router.get("/loginpage", function(req, res, next) {
  res.render("login");
});

router.post("/logindetails", function(req, res, next) {
  uname = req.body["uname"];
  console.log(uname);

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
  console.log(req.body);
});

router.use(log);

module.exports = router;

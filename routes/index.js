var express = require("express");
var mysql = require("mysql");
var router = express.Router();
var book_id = [];

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://35.163.65.254:27017/";
// var url = "mongodb://localhost:27017/";

var ms = mysql.createConnection({
  host: "18.210.39.176",
  // host: "localhost",
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

router.get("/user/:id", function(req, res, next) {
  ms.query(
    "select * from kindle_reviews where reviewerID = '" + req.params.id + "'",
    function(err, user_data){
      
      var keyCount  = Object.keys(user_data).length;
      
      for (var i = 0; i<keyCount; i++){
        book_id.push(user_data[i]['asin'])
      }
      console.log(keyCount)
      console.log(book_id)
      if (err) throw err;
      MongoClient.connect(url, function(err, db) {
      
        if (err) throw err;
        dbo = db.db("goodreads");
        dbo
          .collection("meta_Kindle_Store")
          .find({asin: { $in: book_id }})
          .limit(20)
          .toArray(function(err,book_data){
            
            
            res.render("user", {
              
              data: {user_data: user_data, book_data: book_data}
              
            });
            console.log(user_data);
          });
          
          db.close();
      });
    }
  )
  
});

router.get("/loginpage", function(req,res,next){

  res.render("login");

});

router.post("/logindetails", function(req,res,next){

  uname = req.body["uname"]
  console.log(uname)

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

module.exports = router;

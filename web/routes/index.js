var express = require("express");
var mysql = require("mysql");
var router = express.Router();
var book_id = [];

var fs = require("fs");
var instance = JSON.parse(fs.readFileSync("instance.json", "utf8"));

const {login, register, validate, generate} = require('../models/user.model');
const config = require('config');

const addreview = require("./addreview.js");

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

var dbo;
MongoClient.connect(url, function(err, db) {
    dbo = db.db('goodreads');
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
    dbo.collection("logs").insertOne(myobj, function(err, res) {
      if (err) throw err;
    });
  });
  next();
};

router.use(log);

/* GET home page. */
router.get("/", function(req, res, next) {
  // console.log(req.cookies);
  dbo
    .collection("meta_Kindle_Store")
    .find({})
    .limit(120)
    .toArray(function(err, result) {
      res.cookie('page',req.originalUrl);
      res.render("index", {
        data: { title: "goodreads", books: result},
        cookie: req.cookies
      });
    });
});

//Login
router.post("/login", function(req, res, next) {
  email = req.body["email"];
  password = req.body["psw"];
  page = req.cookies['page']
  // res.redirect('/');
  // // res.redirect('/');
  // // console.log(password);
  login(email,password, function({error,suc,user_info}){
    console.log(user_info);
    if (error){
      // console.log(2);
      // res.status(400).send(error);
      // res.render("index", {data: {error: error}})
      res.cookie('login', false);
      res.cookie('error', error);
      res.cookie('user_info', {});
      res.redirect(page);
    }
    else{
      // console.log(3)
      res.cookie('login', true);
      res.cookie('error', "");
      res.cookie('user_info', user_info);
      res.redirect(page);
      // generate(email, function(err,token){
      //   if (err) res.cookie('error', err);
      //   else{
      //     res.cookie('token', token);
      //     res.redirect('/');
      //   }
      // });
      
      // res.end();
    }
  });
});

//Signup
router.post("/signup", function(req, res, next) {
  page = req.cookies['page']
  email = req.body["email"];
  name = req.body["name1"] + " " + req.body["name2"];
  temp_password = req.body["psw"];
  password = req.body["psw-reenter"];
  if (temp_password != password){
    error = "Passwords do not match!";
    console.log(error);
    res.cookie('login', false);
    res.cookie('error', error);
    res.cookie('user_info', {});
    res.redirect(page);
  }
  else{
    register(email, name, password, function({error,suc,user_info}){
      console.log(name);
      if (error){
        // res.status(400).send(error);
        console.log(error);
        res.cookie('login', false);
        res.cookie('error', error);
        res.cookie('user_info', {});
        res.redirect(page);
      }
      else{
        res.cookie('login', true);
        res.cookie('error', "");
        res.cookie('user_info', user_info);
        res.redirect(page);
        // generate(email, function(err,token){
        //   if (err) res.cookie('error', err);
        //   else{
        //     res.cookie('token', token);
        //     res.redirect('/');
        //   }
        // });
      }
    });
  }
  // console.log(email);
});

router.get('/logout', function(req,res){
  res.cookie('login',false);
  res.clearCookie('user_info');
  res.redirect('/');
});


router.get("/book/:id", function(req, res, next) {
  dbo
    .collection("meta_Kindle_Store")
    .find({ asin: req.params.id })
    .toArray(function(err, book) {
      ms.query(
        "select * from kindle_reviews where asin = ? order by unixReviewTime desc",
        [req.params.id],
        function(err, reviews) {
          if (err) throw err;
          res.cookie('book', req.params.id);
          res.cookie('page',req.originalUrl);
          res.render("book_review", {
            data: { book: book[0], reviews: reviews },
            cookie: req.cookies
          });
        }
      );
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
        if (err) throw err;
        
      dbo
        .collection("meta_Kindle_Store")
        .find({ asin: { $in: book_id } })
        .limit(20)
        .toArray(function(err, book_data) {
          res.cookie('page',req.originalUrl);
          res.render("user", {
            cookie: req.cookies,
            data: {
              user_data: user_data,
              book_data: book_data,
              title: "goodreads"
            }
          });
          // console.log(user_data);
        });

    }
  );
});


router.get("/logs", function(req, res, next) {
  dbo
    .collection("logs")
    .find()
    .sort({date: -1})
    .limit(100)
    .toArray(function(err, result) {
      res.cookie('page',req.originalUrl);
      res.render("logs", {
        cookie: req.cookies,
        data: {logs: result }
      });
    });
  });


router.post("/search", function(req, res, next) {
  var book_id = req.body.book_id;
  dbo
    .collection("meta_Kindle_Store")
    .find({ asin: book_id })
    .toArray(function(err, book) {
      res.cookie('page',req.originalUrl);
      if (book.length == 0) {
        res.render("book_review", {
          cookie: req.cookies,
          data: { err: "Book Not found!" }
        });
      }
      ms.query(
        "select * from kindle_reviews where asin = ?",
        [book_id],
        function(err, reviews) {
          if (err) throw err;
          res.cookie('page',req.originalUrl);
          res.render("book_review", {
            cookie: req.cookies,
            data: { book: book[0], reviews: reviews }
          });
        }
      );
    });
});

router.post("/addreview", addreview);

router.post("/addbook", function(req, res, next) {
  console.log(req.body);
  res.redirect("/");
  
});

router.post("/sort", function(req, res, next){
  console.log(req.body);
});

module.exports = router;

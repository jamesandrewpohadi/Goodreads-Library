var mysql = require("mysql");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "goodreads"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("select * from kindle_reviews where asin = 'B000FA64QO'", function(
    err,
    result
  ) {
    if (err) throw err;
    console.log(result[0]);
  });
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  dbo = db.db("goodreads");
  dbo
    .collection("meta_Kindle_Store")
    .find({})
    .limit(3)
    .toArray(function(err, result) {
      // if (err) {
      //   console.log("errr");
      //   throw err;
      // };
      // console.log(result);
      db.close();
    });
});

const mysql = require('mysql');

var fs = require("fs");
var instance = JSON.parse(fs.readFileSync("instance.json", "utf8"));

var ms = mysql.createConnection({
    host: instance["mysql-server"],
    //host: "localhost",
    user: "root",
    password: "mysql",
    database: "goodreads"
  });

module.exports = function(req,res,next){
    // console.log(req.cookies);
    var asin = req.body.asin;
    var helpful = "[0,0]"
    var reviewerName = req.body.reviewerName;
    var overall = req.body.overall;
    var summary = req.body.summary;
    var reviewText = req.body.reviewText;
    var reviewerID = req.cookies.user_info.user_id;

    var datetime = new Date();

    var date1 = datetime.toLocaleDateString();
    var date2 = datetime.valueOf();

    var reviewTime = date1.slice(0,2) + " " + date1.slice(3,5) + ", " + date1.slice(6,10);
    var unixReviewTime = (datetime/1000) >> 0;

    ms.query("insert into kindle_reviews values (?,?,?,?,?,?,?,?,?)",
        [asin, helpful, overall, reviewText, reviewTime, reviewerID, reviewerName, summary, unixReviewTime],
        function(err,suc){
            if (err) res.cookie('error', err);
            else{
                console.log("Successfully added review");
            }
            res.redirect('/book/' + asin);
        });
};
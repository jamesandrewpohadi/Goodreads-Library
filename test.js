<<<<<<< HEAD
<<<<<<< HEAD
=======
var fs = require("fs");
var obj = JSON.parse(fs.readFileSync("instance.json", "utf8"));
console.log(obj);
>>>>>>> add login middlewares
=======
>>>>>>> 8fc1b4c4e27cdaccaeddfb10dc348c290ea3da84
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const Joi = require('joi');

var ms = mysql.createConnection({
  host: "52.220.10.107",
  //host: "localhost",
  user: "root",
  password: "mysql",
  database: "goodreads"
});

//function to validate user 
function validateUser(user) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(3).max(255).required()
  };

  return Joi.validate(user, schema);
}

function registerUser(email, name, password){
  const {error} = validateUser({ name: name, email: email, password: password })
  if (!error){
    bcrypt.hash('aa',10, function(err,hash){
      ms.query(
        "INSERT INTO user_data VALUES (?,?,?)",
        [email, name, hash],
        function (err, aaa) {
          // console.log(aaa);
          if (err){
            console.log(err.sqlMessage);
          }
          else{
            console.log("Successfully register new user!");
          }
          ms.destroy();
        }
      );
    });
  }
  else{
    console.log(error.details[0].message);
  }
}

function login(email, password){
  ms.query(
    "SELECT password FROM user_data WHERE email = ?",
    [email],
    function (err, res){
      if (err){
        console.log(err);
      }
      else {
        if (!res){
          console.log("User not found!");
        }
        else{
          bcrypt.compare(password, res[0].password,
            function(err,res){
              if (res){
                console.log("Successfully login!");
              }
              else {
                console.log("Incorrect password!");
              }
            })
          ms.destroy();
        }
      }
    }
  )
}

login("aaa","aaa");
// console.log(validateUser({ name: 'aaaa', email: 'aaaaa', password: 'bbbb' }));
// login('aa','ab');
// console.log(crypto.randomBytes(128).toString('hex'));

// const { error } = validateUser({ name: 'aaaa', email: 'aaaaaa@aa.aa', password: 'bbbb' });
// console.log(error);
// console.log('a');
// exports.User = User; 
<<<<<<< HEAD
// exports.validate = validateUser;
=======
// exports.validate = validateUser;
>>>>>>> 8fc1b4c4e27cdaccaeddfb10dc348c290ea3da84

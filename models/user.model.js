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
        console.log(1);
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

function generateToken(email){
  const token = jwt.sign({email: email}, config.get("myprivatekey"));
  return token;
}

exports.login = login;
exports.register = registerUser;
exports.validate = validateUser;
exports.generate = generateToken;
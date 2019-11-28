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

// registerUser("aa","aa","aaa",function(x){
//   console.log(x);
// })

function registerUser(email, name, password, callback){
  const {error} = validateUser({ name: name, email: email, password: password })
  x = {error: "", suc: ""};
  if (!error){
    bcrypt.hash(password,10, function(err,hash){
      ms.query(
        "INSERT INTO user_data VALUES (?,?,?)",
        [email, name, hash],
        function (err, aaa) {
          // console.log(aaa);
          if (err){
            x.error = err.sqlMessage;
            callback(x);
          }
          else{
            console.log("Successfully register new user!");
            x.suc = true;
            callback(x);
          }
          ms.destroy();
        }
      );
    });
  }
  else{
    x.error = error.details[0].message;
    callback(x);
  }
}

function login(email, password, callback){
  x = {error:"",suc:""};
  ms.query(
    "SELECT password FROM user_data WHERE email = ?",
    [email],
    function (err, data){
      if (err){
        x.error = err;
        callback(x);
      }
      else {
        // console.log(data);
        if (!data){
          x.error = "User not found!"
          // console.log(error);
          callback(x);
        }
        else{
          bcrypt.compare(password, data[0].password,
            function(err,result){
              if (result){
                x.suc = result;
                callback(x);
              }
              else {
                x.error = "Incorrect password!"
                callback(x);
              }
            })
          ms.destroy();        
        }
      }
      // return 'aa';
    }
  )
} 

function generateToken(email, callback){
  jwt.sign({email: email}, "myprivatekey", function(err,token){
    callback(token);
  });
}


exports.login = login;
exports.register = registerUser;
exports.validate = validateUser;
exports.generate = generateToken;
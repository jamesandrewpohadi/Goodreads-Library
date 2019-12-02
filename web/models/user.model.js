const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const Joi = require('joi');

var fs = require("fs");
var instance = JSON.parse(fs.readFileSync("instance.json", "utf8"));

var ms = mysql.createConnection({
  host: instance["mysql-server"],
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

// registerUser("vieri7@gmail.com","vieri lala","vieri",function(x){
//   console.log(x);
// })

function registerUser(email, name, password, callback){
  const {error} = validateUser({ name: name, email: email, password: password })
  x = {error: "", suc: "", user_info: ""};
  if (!error){
    bcrypt.hash(password,10, function(err,hash){
      ms.query(
        "INSERT INTO user_data VALUES (null,?,?,?)",
        [email, name, hash],
        function (err, aaa) {
          // console.log(aaa);
          if (err){
            x.error = err.sqlMessage;
            callback(x);
          }
          else{
            console.log("Successfully register new user!");
            login(email,password,function({error,suc,user_info}){
              x.suc = suc;
              x.error = error;
              x.user_info = user_info;
              callback(x);
            })
            
          }
          // ms.destroy();
        }
      );
    });
  }
  else{
    x.error = error.details[0].message;
    callback(x);
  }
}

// login("james@gmail.com", "james", function({error,suc,user_info}){
//   console.log(user_info);
// })


function login(email, password, callback){
  x = {error:"",suc:"",user_info:""};
  ms.query(
    "SELECT * FROM user_data WHERE email = ?",
    [email],
    function (err, data){
      if (err){
        x.error = err;
        callback(x);
      }
      else {
        if (data.length == 0){
          x.error = "User not found!"
          // console.log(error);
          callback(x);
          // ms.destroy(); 
        }
        else{
          bcrypt.compare(password, data[0].password,
            function(err,result){
              if (result){
                x.suc = result;
                generateToken(email, function(err,token){
                  if (err) x.error = err;
                  else{
                    x.user_info = {user_id: data[0].user_id,
                       name: data[0].name, email: email,
                       token: token};
                    callback(x);
                  }
                });
              }
              else {
                x.error = "Incorrect password!"
                callback(x);
              }
              // ms.destroy(); 
            })
                 
        }
      }
      // return 'aa';
    }
  )
} 

// generateToken("aaa",function(err,token){
//   if (err){
//     console.log(1)
//   }
//   else{
//     console.log(2)
//   }
//   console.log(token);
// })

function generateToken(email, callback){
  jwt.sign({email: email}, config.get("myprivatekey"), function(err, token){
    callback(err,token);
  });
}

exports.login = login;
exports.register = registerUser;
exports.validate = validateUser;
exports.generate = generateToken;
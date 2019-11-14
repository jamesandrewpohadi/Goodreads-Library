const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

var ms = mysql.createConnection({
    host: "18.210.39.176",
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

console.log(validateUser({name: 'aaaa', email: 'aaaaaa', password:'bbbb'}));
console.log('a');
// exports.User = User; 
exports.validate = validateUser;
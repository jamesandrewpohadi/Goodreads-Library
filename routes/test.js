const {login, register, validate, generate} = require('../models/user.model');
const config = require('config');

// console.log(login("aa","aab"));
console.log(config.get("myprivatekey"));
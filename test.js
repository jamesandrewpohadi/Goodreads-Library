var fs = require("fs");
var obj = JSON.parse(fs.readFileSync("instance.json", "utf8"));
console.log(obj);

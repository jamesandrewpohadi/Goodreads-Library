// var datetime = new Date().toLocaleDateString();
// console.log(datetime.slice(0,2) + " " + datetime.slice(3,5) + ", " + datetime.slice(6,10));

var datetime = new Date().valueOf();
console.log((datetime/1000) >> 0);
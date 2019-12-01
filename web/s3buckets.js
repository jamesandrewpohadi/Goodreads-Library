// Load the SDK and UUID
var AWS = require("aws-sdk");
var uuid = require("uuid");
var fs = require("fs");

var bucketName = "node-sdk-sample-455342eb-07fb-44dc-bf19-9c7e5bf8c5d9";
var keyName = "kk.js";

var s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const params = {
  Bucket: bucketName,
  Key: "kata.jpg", // File name you want to save as in S3
  Body: fs.readFileSync("test.js")
};

s3.upload(params, function(err, data) {
  if (err) {
    throw err;
  }
  console.log(`File uploaded successfully. ${data.Location}`);
});

// Create a promise on S3 service object
// var bucketPromise = new AWS.S3({ apiVersion: "2006-03-01" })
//   .createBucket({ Bucket: bucketName })
//   .promise();

// bucketPromise
//   .then(function(data) {
//     // Create params for putObject call
//     var objectParams = {
//       Bucket: bucketName,
//       Key: keyName,
//       Body: fs.readFileSync("test.js")
//     };
//     // Create object upload promise
//     var uploadPromise = new AWS.S3({ apiVersion: "2006-03-01" })
//       .putObject(objectParams)
//       .promise();
//     uploadPromise.then(function(data) {
//       console.log(
//         "Successfully uploaded data to " + bucketName + "/" + keyName
//       );
//     });
//   })
//   .catch(function(err) {
//     console.error(err, err.stack);
//   });

//db.UserInfo.drop()

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("Capstone");
  dbo.collection("UserInfo").drop(function(err, delOK) {
    if (err) throw err;
    if (delOK) console.log("Collection deleted");
    db.close();
  });
});
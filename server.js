var express = require("express");
var favicon = require("serve-favicon");
var busboy = require("connect-busboy");
var bodyParser = require("body-parser")
var fs = require('fs');
var path = require("path");

var staticAssets = __dirname + "/public";
var faviconPath = __dirname + "/public/favicon.ico";
var uploadPath = __dirname + "/uploads";
var app = express();

app.use(express.static(staticAssets))
   .use(favicon(faviconPath))
   .use(busboy())

   .get('/', function(req, res) {
    	console.log("ok");
  	})

   .post('/upload', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        var saveto = path.join(uploadPath, filename);
        fstream = fs.createWriteStream(saveto);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("success")
            res.redirect("/");
        });
    });
});

app.listen(8080)

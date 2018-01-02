var express = require("express");
var favicon = require("serve-favicon");
var busboy = require("connect-busboy");
var bodyParser = require("body-parser")
var fs = require('fs');
var path = require("path");
var PythonShell = require("python-shell");

var staticAssets = __dirname + "/public";
var faviconPath = __dirname + "/public/favicon.ico";
var uploadPath = __dirname + "/public/uploads";
var app = express();

var image_name="";
var process_flag=false;
var index_title="Upload";
app
   .set("views", __dirname + "/views") 
   .set("view engine", "hjs")
   .use(express.static(staticAssets))
   .use(favicon(faviconPath))
   .use(busboy())

   .get('/', (req, res) => {
	res.render("index", {
		image_ready: process_flag,
		image_filename: image_name,
		select_file: true,
		title: index_title
	})

    })

   .post("/process", function(req, res) {
	var options = {
		pythonPath: "/usr/bin/python3.5",
		args: [staticAssets, image_name]
	};
	PythonShell.run("./greyscale.py", options, function(err, data){
		if(err) res.send(err);
		console.log("processing done!");
		image_name = data.toString();
		console.log(image_name)
		res.render("index", {
			image_ready: true,
			image_filename: image_name,
			select_file: false,
			title: "Converted"
		})
	});
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
		    console.log("File successfully uploaded");
		});
		image_name = "uploads/" + filename;

		res.render("index", {
			image_ready: true,
			image_filename: image_name,
			select_file: false,
			title: "Process"
		})
	 })
    })

app.listen(8080)

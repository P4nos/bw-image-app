const logger = require('./logger');
var express = require("express");
var favicon = require("serve-favicon");
var busboy = require("connect-busboy");
var bodyParser = require("body-parser")
var snakeCase = require('snake-case');
var fs = require('fs');
var path = require("path");
var exec = require("child_process").execSync;
const sys = require("sys")

const staticAssets = __dirname + "/public";
const faviconPath = __dirname + "/public/favicon.ico";
const uploadPath = __dirname + "/public/uploads";
const generatedPath = __dirname + "/public/output";
const modelsPath = __dirname + "/fast-neural-style/models";

const process_flag=false;
const image_name = "";
const out_filename = "";
const default_gen_image_name = "generated_image";

const app = express();

app
	.set("views", __dirname + "/views") 
	.set("view engine", "hjs")
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({extended: true}))
	.use(express.static(staticAssets))
	.use(favicon(faviconPath))
	.use(busboy())

	.get('/', function(req, res) {
		const logObj = {
			request_type: req.method,
			hostname: req.hostname,
			http_body: req.body
		}

		logger.info(logObj);

		res.render("index", {
			image_ready: process_flag,
			image_filename: "",
			select_file: true,
			loader: false,
			title: "Upload"
		})
	})
	.post('/upload', function(req, res) {
		var fstream;
		req.pipe(req.busboy);
		req.busboy.on('file', function (fieldname, file, filename) {
			// Convert filename to snake case
			var parser = path.parse(filename);
			var parse_filename = snakeCase(parser["name"]) + parser["ext"];
			console.log("Uploading: " + filename);
			console.log("Parse filename: " + parse_filename);

			var saveto = path.join(uploadPath, parse_filename);

			fstream = fs.createWriteStream(saveto);
			file.pipe(fstream);

			fstream.on('close', function () {
				console.log("File successfully uploaded");
			});
			// Update global variable. CAUTION when updating this variable!
			image_name = parse_filename;
			var image_filepath = path.join("./uploads", image_name); // uploadPath doesnt work here. dont know why

			res.render("index", {
				image_ready: true,
				image_filename: image_filepath,
				select_file: false,
				loader: false,
				title: "Process"
			})
		})
	})
	.post("/process", function(req, res ,next) {
		//TODO: create spinner while the transformation is running 
		//TODO: Use logging package
		var style_model = path.join(modelsPath, req.body.style);
		// Create unique output filename
		out_filename =  default_gen_image_name + new Date().getTime() + ".png"
		var output_image_path = path.join(generatedPath, out_filename);
		var process_image = path.join(uploadPath, image_name);

		console.log(output_image_path, process_image);
		var lua_command = "th ./fast-neural-style/fast_neural_style.lua -model " + style_model
		+ " -input_image " + process_image
		+ " -output_image " + output_image_path
		
		var process = exec(lua_command, function(error, stdout, stderr) {
			// Convert to logging
			sys.print('stdout:' + stdout);
			sys.print('stderr:' +  stderr);
			if (error != null){
				console.log("exec error: " + error);
			}
		})
		next()		
	}, function (req, res){
		res.render("index", {
			image_ready: true,
			image_filename: "./output/" + out_filename,
			select_file: false,
			loader: false,
			title: "Done"
		})
	})

app.listen(8080)

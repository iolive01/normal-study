
var http = require("http");
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var nodemailer = require("nodemailer");
var json2csv = require('json2csv');

http.createServer(function (request, response) {
	if (request.method.toLowerCase() == 'get') {
		displayForm(response);
	} else if (request.method.toLowerCase() == 'post') {
		processForm(request, response);
	}
}).listen(8081);

//Handles http get request.
function displayForm(response) {

	fs.readFile('normal_study_form.html', function(err, data) { 
		response.writeHead(200, {'Content-type': 'text/html', 
			'Content-Length': data.length
		});
		response.write(data);
		response.end();
	});

}

//Processes the form data.
function processForm(request, response) {

	var form = new formidable.IncomingForm();
	form.parse(request, function (err, fields, files) {
		updateFile(fields)
		sendAlert(fields);
		sendWelcome(fields);
		fs.readFile('confirmation.html', function(err, data) {
			response.write(data);
			response.end();
		});
	})

} 
	
//Adds the data from the form to the csv file.
function updateFile(fields) {

	var stream = fs.createWriteStream("normal_participants.csv", {'flags': 'a'});
	stream.once('open', function(fd) {
		var csv = json2csv({data: fields, hasCSVColumnTitle: false},
		 function(err, csv) {
			if (err) console.log(err);
			stream.write('\n' + csv);
		});
		stream.end();
	});

}

//might want to change this
var transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "iris.oliver@constanttherapy.com",
		pass: "con$t@nt"
	}
});

//Sends an email alerting me that someone has filled out the form online.
function sendAlert(fields) {

	transporter.sendMail({ //temporary, need to switch addresses etc
		from: 'iris.oliver@constanttherapy.com',
		to: 'iris.oliver@constanttherapy.com',
		subject: fields.name + 'has signed up for the study',
		text: fields.name + ' '  + fields.email +  ' '
	});

}

//Purpose: sends a welcome email to the participant
//Return values: none
//Arguments: the data from the form
function sendWelcome(fields) {

	transporter.sendMail({
		from: 'iris.oliver@constanttherapy.com',
		to: fields.email,
		subject: 'Thank you for volunteering for the study!',
		text: 'hi'
	});

}


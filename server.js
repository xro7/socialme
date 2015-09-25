var express = require('express');
var http = require('http');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var app = express();
var busboy = require('connect-busboy');
var router = require('./router');




app.set('view engine','ejs');
app.use(busboy());
app.use(cookieParser('notsosecretkey'));
app.use(session({secret: 'notsosecretkey123'}));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));
//app.use(express.cookieParser('cookieSercet'));
//app.use(express.session({secret: 'sessionSecret'}));


var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '6654266542',
	database : 'twitter_db'
});

connection.connect(function(error){
	if (error){
		console.log('cant connect to database');
		process.exit(code=0);
	}
	console.log('connected to database');
});



var server = app.listen(8000,function(){
	console.log('Express server listening on port 8000');

});

var io = require('socket.io')(server);

router(app,connection);

var users = {};
	io.on('connection',function(socket){
		console.log('user connected');
		socket.on('disconnect',function(){
			console.log('user disconected');
			//users.splice(users.indexOf(socket.username));
			delete users[socket.nickname];
			io.emit('user update',Object.keys(users));

		});
		socket.on('send message',function(data){
			console.log(data);	
			io.emit('new message',{msg:data,nickname:socket.nickname});
		});
		socket.on('new user',function(name){
			console.log('user '+name+' added');
			socket.nickname = name;
			//users.push(socket.nickname);
			users[socket.nickname] = socket;
			io.emit('user update',Object.keys(users));

		});
	});

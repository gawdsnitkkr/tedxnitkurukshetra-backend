/**
 * Created by Narendra on 13/8/17.
 */
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var session= require('express-session');
var multer = require('multer');
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ted"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
app.use(express.static(path.join(__dirname, 'www')));
app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true}));
app.use(session({
    secret: 'ted-x-gawds',
    resave: true,
    saveUninitialized: true
}));
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./www/images");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});
var upload = multer({
    storage: Storage
}).array("images", 3);
app.get('/login' , function (req , res) {
    if(req.session.user) {
        res.redirect('/admin');
    }else {
        res.sendFile(__dirname + '/www/login.html');
    }
});
app.post('/login' , function (req , res) {
    login(req , res);
});
app.get('/admin'  ,  function (req , res) {
    console.log(req.session.user);
    if(!req.session.user) {
        console.log("Admin");
        res.redirect('/login');
    }else {
        res.sendFile(__dirname + '/www/admin.html');
    }
});
app.get('/speaker' , function (req , res) { 
	res.sendFile(__dirname + '/www/speaker.html');
});
app.post('/speaker' , function (req , res) { 
    var sql = "SELECT * FROM speaker ";
    con.query(sql, function (err, result, fields) {
        var jsonString = JSON.stringify(result);
        var jsonData = JSON.parse(jsonString);
        res.send(jsonData);
    });
});
app.post("/speakerinsert", function(req, res) {
    upload(req ,res, function(err) {
        if (err) {
            return res.end("Something went wrong!");
        }
        return res.end("File uploaded sucessfully!.");
    });
    insertSpeaker(req , res);
});
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect("/login");
});
app.post('/getuser' , function (req , res) {
    res.send({"username" : req.session.user});
});
app.get('/blog' , function (req , res) { 
	res.sendFile(__dirname + '/www/blog.html');
});
app.post('/blog' , function (req , res) { 
    var sql = "SELECT * FROM videos";
    con.query(sql, function (err, result, fields) {
        var jsonString = JSON.stringify(result);
        var jsonData = JSON.parse(jsonString);
        res.send(jsonData);
    });
});
function login(req,res){
    var post = req.body;
    var username  = post.user;
    var password = post.password;
    var sql = "SELECT * FROM login WHERE username='"+username+"'";
    con.query(sql, function (err, result, fields) {
        var jsonString = JSON.stringify(result);
        var jsonData = JSON.parse(jsonString);
        if( jsonData.length > 0 && jsonData[0].password === password ) {
            console.log(req.session.user + "Auth set");
            req.session.user = post.user;
            res.send({"result" : "Found"});
        }else {
            res.send({"result": "NotFound"});
        }
    });
}
function insertSpeaker(req , res ) {
    var post = req.body;
    var name  = post.speakername;
    var topic = post.topic;
    var description = post.description;
    var sql = "INSERT INTO speaker(name, topic, description, pic_url) values('"+name+"','"+topic+"','"+description+"','/images/"+post.images+"')";
    con.query(sql, function (err, result, fields) {
        console.log(result);
    });
}
// Starting Server
server.listen(3000, function(){
    console.log('listening on *:3000');
});


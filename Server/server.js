//npm install
const express = require("express");
var session = require('express-session');
const cors = require('cors');
const fs = require("fs"); //built-in
const multer = require("multer");
const bodyParser = require('body-parser');
const mysql = require('mysql');
const IPs = require('./getLocalIPs.js').getLocalIPs();
var path = require('path'); //builtin

const app = express();
const ip = 'localhost';
//const ip = IPs["Wi-Fi"].IPv4;     //when connected to wifi 
const port = 3000;
const upload = multer({ dest: '/tmp' });
const urlencodedparser = bodyParser.urlencoded({ extended: false });

var user;

//dir of server
console.log(__dirname);

//dir of website
const dir = `A:\\Downloads\\YourCloud\\Website`;

app.use(cors());
app.use(express.static(dir));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//execute yourcloud.sql before this
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "yourcloud"
});
//connect to database
con.connect(function (err) {
    if (err) throw err;
    app.listen(port, ip, () => {
        console.log(`${ip}:${port}`);
    });
});

//home
app.get('/', (req, res) => {
 });

//register user
app.post('/register', urlencodedparser, (req, res) => {
    console.log("reg req");
    var FirstName = req.body.first_name;
    var LastName = req.body.last_name;
    var Email = req.body.email;
    var Password = req.body.password;
    var Plan = req.body.plan;
    console.log(FirstName + LastName + Email + Password + Plan);
    var sql = `INSERT INTO User (FirstName, LastName, Email, Password, Plan) VALUES ('${FirstName}', '${LastName}','${Email}','${Password}','${Plan}')`;
    con.query(sql, function (err, result) {
        if (err){
            res.send("<script>alert('Email ID already exists :(');window.location.replace('register.html');</script>")
        } 
        else {
            req.session.loggedin = true;
            req.session.user = Email;
            user = Email;
            res.redirect("/files.html");
        }
    });
});

//login authentication
app.post('/auth', urlencodedparser, (request, response) => {
    console.log("log req");
    var Email = request.body.email;
    var Password = request.body.password;
    console.log(Email + Password);
    if (Email && Password) {
        con.query('SELECT * FROM User WHERE email = ? AND password = ?', [Email, Password],
            (error, results, fields) => {
                if (results.length > 0) {
                    request.session.loggedin = true;
                    request.session.email = results[0].Email;
                    request.session.id = results[0].Id;
                    user = Email;
                    response.redirect('/files.html');
                } else {
                    response.send("<script>alert('Incorrect Username and/or Password!');window.location.replace('login.html');</script>");
                }
                response.end();
            });
    } else {
        response.send("<script>alert('Please enter Username and Password!');window.location.replace('login.html');</script>");
        response.end();
    }
});

// app.get('/home', function (request, response) {
//     console.log("in head");
//     if (request.session.loggedin) {
//         response.send('Welcome back, ' + request.session.user + '!');
//     } else {
//         response.send('Please login to view this page!');
//     }
//     response.end();
// });

//upload a file
app.post('/upload', upload.single('file'), (req, res) => {
    console.log("recieved request");
    const folder = `uploads/${user}`;
    const path = `./${folder}/${req.file.originalname}`;

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    fs.readFile(req.file.path, (err, data) => {
        fs.writeFile(path, data, (err) => {
            if (err) {
                console.error(err);
                return res.send({ message: 'Sorry, file coudn\'t be uploaded.' });
            }

            var name = req.body.name;
            var size = req.body.size;
            var date = req.body.date;
            var link = `/uploads/${user}/${req.file.originalname}`;
            console.log(user);
            //console.log(req.session.user); //doesnt work :/
            var sql = `INSERT INTO Files (email, name, size, date, link) VALUES ('${user}', '${name}','${size}','${date}','${link}')`;
            con.query(sql, function (err, result) {
                if (err) res.status(400).send(err);
                console.log("db updated");
                //redirect to same page maybe
            });
            console.log("uploaded at: " + link);
            res.send({ success: true, flink: link });
        });
    });
});

//show uploaded files
app.get('/table', (req, res) => {
    console.log("in table: user=" + user);
    var Email = user;
    var sql = `select * from Files where email='${Email}'`;
    con.query(sql, (error, results, fields) => {
        console.log("rows=" + results.length);
        var table = [];
        if (results.length > 0) {
            console.log("query success");
            for (var i = 0; i < results.length; ++i) {
                var obj = {
                    name: results[i].name,
                    size: results[i].size,
                    date: results[i].date,
                    link: results[i].link
                }
                console.log("obj" + i + " - " + obj);
                table.push(obj);
            }
            console.log(table);


        }
        res.send({ values: table, name: user });
    });
});

//download link
app.get('/uploads/:user/:file', (req, res) => {
    console.log(req.params.file + " is requested by " + req.params.user);
    res.sendFile(`${__dirname}/uploads/${req.params.user}/${req.params.file}`);
});
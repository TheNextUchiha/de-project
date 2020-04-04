//cmd for Heroku & gitbash for Git and Github
// require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const {mongoose} = require('./server/db/mongoose');
const {User} = require('./server/models/user');


require('./passport-config')(passport);

const index = require('./routes/index');
// const users = require('./routes/users');
// const auth = require('./routes/auth')(passport);

var app = express();

//Handlebars Setup
app.set('view engine','hbs');

// ----> Express Middle-wares <-----
app.use(express.urlencoded({extended: false})); // To Parse URL data
app.use(express.json());                        // To Parse JSON data
app.use(cookieParser());                        // To Parse Cookie data
app.use(express.static(__dirname + '/views'));  // To include static HTML pages
app.use(session({                               // Session Config
    secret: 'mysecret',
    saveUninitialized: false,
    resave: false
}));

// Passport Setup
app.use(passport.initialize());     // Passport Initialization
app.use(passport.session());        // Passport Session Management

// Routes
app.use('/', index);

/*
-----> Maintenance Mode <-----

app.use((req, res, next) => { 
    res.render('maintenance.hbs');
});

*/

//App initialization at Express server on a specified port no.

var server = app.listen(8080, () => {
    var port = server.address().port;
    console.log(`Server is up at port ${port}`);
});
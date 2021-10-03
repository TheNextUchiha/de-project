const express = require('express');
const favicon = require('serve-favicon');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const { mongoose } = require('./server/db/mongoose');

const index = require('./routes/index');
const login = require('./routes/login');
const signup = require('./routes/signup');
const editProfile = require('./routes/editprofile');
const getUser = require('./routes/user');
const home = require('./routes/home');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv/config');
}

const port = process.env.PORT;

const app = express();

const sessionOptions = {
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
};

//Handlebars Setup
app.set('view engine', 'hbs');

// ----> Express Middle-wares <-----
app.use(favicon(__dirname + '/public/icons/favicon.ico')); // To serve Favicon to the client
app.use(express.urlencoded({ extended: false })); // To Parse URL data
app.use(express.json()); // To Parse JSON data
app.use(express.static(__dirname + '/views')); // To include static HTML pages
app.use(
    session({
        secret: 'bruhbruhbruh',
        resave: false,
        saveUninitialized: false,
        unset: 'destroy',
        store: MongoStore.create(sessionOptions),
        cookie: {
            maxAge: 1000 * 60 * 30, // 30 minutes --> Format: millisec * sec * min
        },
    })
);

// -----> Routes <-----
app.use(index);
app.use(login);
app.use(signup);
app.use(editProfile);
app.use(getUser);
app.use(home);

/*
-----> Maintenance Mode <-----

app.use((req, res, next) => { 
    res.render('maintenance.hbs');
});

*/

//App initialization at Express server on a specified port no.

// var server = app.listen(8080, () => {            \\ For RedHat OpenShift
//     var port = server.address().port;
//     console.log(`Server is up at port ${port}`);
// });

app.listen(port, () => {
    console.log('Server up at port: ' + port);
});

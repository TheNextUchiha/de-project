//cmd for Heroku & gitbash for Git and Github

const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

const port = process.env.PORT || 1234;
var app = express();

//Handlebars Setup
app.set('view engine','hbs');

//Express Middle-wares
// app.use((req, res, next) => {
//     var now = new Date().toString();
//     var log = `${now}: ${req.method} ${req.url}`;

//     console.log(log);
//     fs.appendFile('server.log',log + '\n',(err) => {
//         if(err) {
//             console.log('Unable to append to server.log');
//         }
//     });
//     next();
// });

/* ---> Maintenance Mode <---

app.use((req, res, next) => { 
    res.render('maintenance.hbs');
});

*/

app.use(express.static(__dirname + '/views')); // To include static HTML pages

//Handlebars Helpers
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

//Request Handlers
app.get('/', (req, res) => {
    res.render('landing.hbs');
});

app.get('/login', (req, res) => {
    res.render('login.hbs');
});

app.get('/signup', (req, res) => {
    res.render('signup.hbs');
});

app.get('/editprofile', (req, res) => {
    res.render('editprofile.hbs');
});

app.get('/home', (req, res) => {
    res.render('home.hbs');
});

app.get('/bad',(req, res) => {
    res.send({
        errorMessage: 'An error occured bruh'
    });
});

//App initialization at Express server on a specified port no.
app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
});
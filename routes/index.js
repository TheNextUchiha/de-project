var express = require('express');
const router = express.Router();
const _ = require('lodash');
var {User} = require('./../server/models/user');
const passport = require('passport');

// To check if a user is logged in or not
var loggedin = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};

// -----> GET Routes <-----
router.get('/', (req, res) => {
    res.render('landing');
});

router.get('/login', (req, res) => {
    // console.log(req.error('error'));
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/home', loggedin, (req, res) => {    
    res.render('home');
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// -----> POST Routes <-----

router.post('/signup', (req, res) => {
    var body = _.pick(req.body, ['email', 'username', 'password']);
    body.username = body.username.toLowerCase();
    
    var user = new User(body);
    console.log(user);
    user.save((err, user) => {
        
        if(!err) {
            console.log('NO ERR');
            res.render('login', {
                error: true,
                errorMessage: 'Log in using the credentials.'
            });
        }else if(err.code === 11000 && err.keyPattern.username > 0) {
            console.log('UNAME');
            res.render('signup', {
                error: true,
                errorMessage: 'Username already taken.'
            });
        } else if(err.code === 11000 && err.keyPattern.email > 0) {
            console.log('MAIL');
            res.render('signup', {
                error: true,
                errorMessage: 'User already exists.'
            });
        } else {
            console.log('BRUH');
            res.render('signup', {
                error: true,
                errorMessage: 'An unknown error occured.'
            });
        }
    });    
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login'
}));

module.exports = router;
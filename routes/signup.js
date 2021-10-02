const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { User } = require('./../server/models/user');

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res) => {
    const body = _.pick(req.body, ['email', 'username', 'password']);
    body.username = body.username.toLowerCase();

    const user = new User(body);

    user.save((err, user) => {
        if (!err) {
            res.render('login', {
                error: true,
                errorMessage: 'Log in using the credentials.',
            });
        } else if (err.code === 11000 && err.keyPattern.username > 0) {
            res.render('signup', {
                error: true,
                errorMessage: 'Username already taken.',
            });
        } else if (err.code === 11000 && err.keyPattern.email > 0) {
            res.render('signup', {
                error: true,
                errorMessage: 'User already exists.',
            });
        } else {
            console.log('ERROR WHILE SIGNUP: ', err);
            res.render('signup', {
                error: true,
                errorMessage: 'An unknown error occured.',
            });
        }
    });
});

module.exports = router;

const express = require('express');
const _ = require('lodash');

const router = express.Router();

const {User} = require('./../server/models/user');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['username', 'password']);
    
        const user = await User.findOne({username: body.username.toLowerCase()});
    
        if(user) {
            if(user.comparePassword(body.password, user.password)) {
                req.session.user = {
                    username: user.username,
                    userID: user._id
                };
                res.redirect('/home');
            } else {
                res.redirect(400, '/');
            }
        } else {
            res.redirect('/');
        }
    } catch(err) {
        res.send(500);
    }
});

module.exports = router;
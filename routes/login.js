const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { User } = require('./../server/models/user');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['username', 'password']);

        const user = await User.findOne({
            username: body.username.toLowerCase(),
        });

        if (!user) {
            return res.redirect('/');
        }

        if (user.comparePassword(body.password, user.password)) {
            req.session.user = {
                username: user.username,
                userID: user._id,
            };
            return res.redirect('/home');
        } else {
            return res.redirect(400, '/');
        }
    } catch (err) {
        return res.status(500).send();
    }
});

module.exports = router;

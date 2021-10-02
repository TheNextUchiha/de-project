const express = require('express');

const router = express.Router();

const { User } = require('./../server/models/user');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv/config');
}

// -----> GET Routes <-----
router.get('/', (req, res) => {
    res.render('landing');
});

router.get('/forgot', (req, res) => {
    res.render('forgot');
});

// -----> POST Routes <-----

router.post('/forgot', (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (!user) {
            return res.render('forgot', {
                error: true,
                errorMessage: 'User not Found',
            });
        }
        // res.header('email', email);
        res.redirect('/forgot-verify');
    });
});

module.exports = router;

/*
-----> Under GET /home <-----

    if(!err) {
        if(user.counter === 0) {
            return res.redirect('editprofile');
        } else {
            User.findByIdAndUpdate(userID, {
                $inc: {
                    counter: 1
                }
            }, (err, result) => {
                if(!err) {
                    res.render('home');
                } else {
                    res.redirect('login');
                }
            });
        }
    } else {
        res.redirect('login');
    }

    -----> GET /forgot-verify <-----

    router.get('/forgot-verify', (req, res) => {
        console.log('Request object: ', req);
        console.log('req.body: ', req.body);
        console.log('req.headers', req.headers);

        res.render('forgotverify');
    });

    -----> GET /forgot-reset <-----

    router.get('/forgot-reset', (req, res) => {
        res.render('forgot');
    });


    -----> POST /forgot-verify <-----

    router.post('/forgot-verify', (req, res) => {
    const {email} = req.body;

    console.log('req.body: ', req.body);
    console.log('req.headers', req.headers);

    User.findOne({email}, (err, user) => {
        if(!user) {
            return res.render('forgot', {
                error: true,
                errorMessage:  'User not Found'
            });
        }

        res.redirect('/forgot-verify');
    });
});

*/

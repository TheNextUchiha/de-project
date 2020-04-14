var express = require('express');
const router = express.Router();
const _ = require('lodash');
const passport = require('passport');
const {ObjectID} = require('mongodb');

var {User} = require('./../server/models/user');
var {UserDetails} = require('./../server/models/userDetails');

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
    res.render('login');
});

router.get('/forgot', (req, res) => {
    res.render('forgot');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/editprofile', loggedin, (req, res) => {
    res.render('editprofile');
});

router.get('/users/:UserID', (req, res) => {
    const UserID = req.params.UserID;
    console.log(req.params);

    UserDetails.findOne({UserID}, (err, result) => {
        if(err) {
            return res.status(404).send();
        }

        res.render('qr-result', {
            name: result.name,
            mobilenum: result.mobilenum,
            address: result.address,
            email: result.email
        });
    });

});

router.get('/generate-qr', loggedin, (req, res) => {
    const userID = req.session.passport.user.userID; 
    
    UserDetails.findOneAndUpdate({userID}, {
        $set: {
            qr: 'http://api.qrserver.com/v1/create-qr-code/?data=http://de-project-git-de-project-237244.apps.us-east-1.starter.openshift-online.com/users/'+userID+'&size=800x800'
        }
    }, (err, result) => {
        if(err) {
            console.log('ERROR: ', err);
            return res.redirect('editprofile');
        }
    });

    UserDetails.findOne({userID}, (err, result) => {
        if(err) {
            return res.redirect('home');
        }

        res.send('<img src="'+result.qr+'">');
    });
});

router.get('/home', loggedin, (req, res) => {
    const userID = req.session.passport.user.userID;

    User.findById(userID, (err, user) => {
        if(err) {
            return res.redirect('login');
        }

        if(user.counter === 0) {
            return res.redirect('editprofile');
        } else {
            User.findByIdAndUpdate(userID, {
                $inc: {
                    counter: 1
                }
            }, (err, result) => {
                if(err) {
                    return res.redirect('login');
                }
                
                UserDetails.findOne({userID}, (err, result) => {
                    if(err) {
                        return res.redirect('login');
                    }
                    
                    res.render('home', {
                        name: result.name,
                        mobilenum: result.mobilenum,
                        address: result.address,
                        email: user.email
                    });
                });
            });
        }
    });
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
    
    user.save((err, user) => {
        
        if(!err) {
            res.render('login', {
                error: true,
                errorMessage: 'Log in using the credentials.'
            });
        } else if(err.code === 11000 && err.keyPattern.username > 0) {
            res.render('signup', {
                error: true,
                errorMessage: 'Username already taken.'
            });
        } else if(err.code === 11000 && err.keyPattern.email > 0) {
            res.render('signup', {
                error: true,
                errorMessage: 'User already exists.'
            });
        } else {
            console.log('ERROR WHILE SIGNUP: ', err);
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

router.post('/editprofile', (req, res) => {
    const body = _.pick(req.body, ['name', 'mobile', 'state', 'address', 'sec_que', 'sec_ans']);
    const userID = new ObjectID(req.session.passport.user.userID);
    
    User.findById(userID, (err, user) => {
        if(err) {
            console.log('ERROR: ', err);
            return res.render('home', {
                error: true,
                errorMessage: 'idk but User not found'
            });

        }
        if(user.counter === 0) {
            body.sec_ans = body.sec_ans.toLowerCase();
            const userDetails = new UserDetails({
                userID: new ObjectID(user._id),
                name: body.name,
                mobilenum: body.mobile,
                state: body.state,
                address: body.address,
                sec_que: body.sec_que,
                sec_ans: body.sec_ans.toLowerCase()
            });    

            userDetails.save((err, user) => {
                if(err) {
                    return res.render('home');
                } 
                
                res.send();
            });

            User.findByIdAndUpdate(userID, {
                $inc: {
                    counter:1
                }
            }, (err, result) => {
                if(err) {
                    console.log('ERROR WHILE INCREMENTING');
                    return res.redirect('login');
                }
                
                res.redirect('home');
            });
        } else {
            UserDetails.findOneAndUpdate({userID}, {
                $set: {
                    name: body.name,
                    mobilenum: body.mobile,
                    state: body.state,
                    address: body.address,
                    sec_que: body.sec_que,
                    sec_ans: body.sec_ans.toLowerCase()
                }
            }, (err, result) => {
                if(err) {
                    console.log('ERROR: ', err);
                    return res.redirect('editprofile');
                }

                res.redirect('home');
            });
        }
    });
});

router.post('/forgot', (req, res) => {
    const {email} = req.body;

    User.findOne({email}, (err, user) => {
        if(!user) {
            return res.render('forgot', {
                error: true,
                errorMessage:  'User not Found'
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
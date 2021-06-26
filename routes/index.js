const express = require('express');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const router = express.Router();

const {authenticate} = require('./../middlewares/authenticate');
const {User} = require('./../server/models/user');
const {UserDetails} = require('./../server/models/userDetails');
const {transporter} = require('./../utils/nodemailer');

if(process.env.NODE_ENV !== 'production') {
    require('dotenv/config');
}

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

router.get('/editprofile', authenticate, (req, res) => {
    res.render('editprofile');
});

router.get('/users/:UserID', (req, res) => {
    const userID = req.params.UserID;

    UserDetails.findOneAndUpdate({userID}, {
        $inc: {
            qrcount: 1
        }
    }, (err, result) => {
        if(err) {
            console.log('ERROR: ', err);
        }
    });

    UserDetails.findOne({userID}, (err, user) => {
        if(err) {
            return res.status(404).send();
        }
        User.findById(userID, (err, result) => {
            if(err) {
                return res.status(404).send();
            }

            const mailOptions = {
                from: 'deproject237344@gmail.com <Lost & Found Center>',
                to: result.email,
                subject: 'Your QR Code was recently scanned!',
                text: 'Greetings from the Lost & Found Center!!\n\nYour QR Code was recently scanned by someone!\n\nHope to recieve a call soon by them.'
            };

            if(user.qrcount > user.qrcountprev) { 
                transporter.sendMail(mailOptions, (err, data) => {
                    if(err) {
                        return console.log('Error while sending mail: ', err);
                    }
                    console.log('MAIL SENT!');
                });

                UserDetails.findOneAndUpdate({userID}, {
                    $inc: {
                        qrcountprev: 1
                    }
                }, (err, result) => {
                    if(err) {
                        console.log('ERROR: ', err);
                        return res.redirect('home');
                    }
                });
            }

            res.render('qr-result', {
                name: user.name,
                mobilenum: user.mobilenum,
                address: user.address,
                email: result.email
            });
        });
    });
});

router.get('/generate-qr', authenticate, (req, res) => {
    const userID = req.session.user.userID; 
    
    UserDetails.findOneAndUpdate({userID}, {
        $set: {
            qr: 'http://api.qrserver.com/v1/create-qr-code/?data=https://secure-stream-40258.herokuapp.com/users/'+userID+'&size=600x600&margin=10'
        }
    }, (err, result) => {
        if(err) {
            console.log('ERROR: ', err);
            return res.redirect('home');
        }
    });

    UserDetails.findOne({userID}, (err, result) => {
        if(err) {
            return res.redirect('home');
        }
        
        res.render('qr', {
            src: result.qr
        });
    });
});

router.get('/home', authenticate, (req, res) => {
    const userID = req.session.user.userID;

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
    try {
        req.session.destroy(err => {
            if(err) {
                return res.redirect('/home');
            }
            res.clearCookie('cookie');
            res.redirect('/');
        });
    } catch(err) {
        res.send(`Error while logging you out: ${err}`);
    }
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

router.post('/editprofile', authenticate, (req, res) => {
    const body = _.pick(req.body, ['name', 'mobile', 'state', 'address', 'sec_que', 'sec_ans']);
    const userID = new ObjectID(req.session.user.userID);
    
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
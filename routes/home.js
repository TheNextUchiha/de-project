const express = require('express');

const router = express.Router();

const {authenticate} = require('./../middlewares/authenticate');
const {User} = require('./../server/models/user');
const {UserDetails} = require('./../server/models/userDetails');

router.get('/generate-qr', authenticate, async (req, res) => {
    const userID = req.session.user.userID; 
    
    let userDetails;

    try {
        await UserDetails.findOneAndUpdate({userID}, {
            $set: {
                qr: 'http://api.qrserver.com/v1/create-qr-code/?data=https://secure-stream-40258.herokuapp.com/users/'+userID+'&size=600x600&margin=10'
            }
        });
    } catch(err) {
        console.log('Error: ', err);
        return res.redirect('home');
    }

    try {
        userDetails = await UserDetails.findOne({userID});
        
        return res.render('qr', {
            src: userDetails.qr
        });
    } catch(err) {
        return res.redirect('home');
    }
});

router.get('/home', authenticate, async (req, res) => {
    const userID = req.session.user.userID;

    let user, userDetails;

    try {
        user = await User.findOne({userID});
    } catch(err) {
        return res.redirect('login');
    }

    if(user.counter === 0) {
        return res.redirect('editprofile');
    }

    user.counter += 1;

    try {
        await user.save();
    } catch(err) {
        return res.redirect('login');
    }

    try {
        userDetails = await UserDetails.findOne({userID});

        return res.render('home', {
            name: userDetails.name,
            mobilenum: userDetails.mobilenum,
            address: userDetails.address,
            email: user.email        
        });
    } catch(err) {
        return res.redirect('login');
    }
});

router.get('/logout', (req, res) => {
    try {
        req.session.destroy(err => {
            if(err) {
                return res.redirect('/home');
            }
            res.clearCookie('cookie');
            return res.redirect('/');
        });
    } catch(err) {
        return res.send(`Error while logging you out: ${err}`);
    }
});

module.exports = router;
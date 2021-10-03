const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { authenticate } = require('./../middlewares/authenticate');
const { User } = require('./../server/models/user');
const { UserDetails } = require('./../server/models/userDetails');

router.get('/editprofile', authenticate, async (req, res) => {
    const userID = req.session.user.userID;
    let user;

    try {
        user = await UserDetails.findOne({ userID });
    } catch (err) {
        return res.render('home', {
            error: true,
            errorMessage: 'User not found!',
        });
    }

    console.log(user);

    res.render('editprofile', { user });
});

router.post('/editprofile', authenticate, async (req, res) => {
    const userID = req.session.user.userID;

    const body = _.pick(req.body, [
        'name',
        'mobile',
        'state',
        'address',
        'sec_que',
        'sec_ans',
    ]);

    let user;

    try {
        user = await User.findOne({ _id: userID });
    } catch (err) {
        console.log('ERROR: ', err);
        return res.render('home', {
            error: true,
            errorMessage: 'User not found!',
        });
    }

    if (user.counter === 0) {
        body.sec_ans = body.sec_ans.toLowerCase();

        const userDetails = new UserDetails({
            userID: user._id,
            name: body.name,
            mobilenum: body.mobile,
            state: body.state,
            address: body.address,
            sec_que: body.sec_que,
            sec_ans: body.sec_ans.toLowerCase(),
        });

        try {
            await userDetails.save();
        } catch (err) {
            return res.render('home');
        }

        try {
            await User.findOneAndUpdate(userID, {
                $inc: {
                    counter: 1,
                },
            });

            res.redirect('home');
        } catch (err) {
            return res.redirect('login');
        }
    }

    let userDetails;

    try {
        userDetails = await UserDetails.findOne({ userID });
    } catch (err) {
        console.log('ERROR: ', err);
        return res.redirect('editprofile');
    }

    body.sec_ans = body.sec_ans.toLowerCase();

    userDetails.name = userDetails.name ? body.name : body.name;
    userDetails.mobilenum = userDetails.mobilenum ? body.mobile : body.mobile;
    userDetails.state = userDetails.state ? body.state : body.state;
    userDetails.address = userDetails.address ? body.address : body.address;
    userDetails.sec_que = userDetails.sec_que ? body.sec_que : body.sec_que;
    userDetails.sec_ans = userDetails.sec_ans ? body.sec_ans : body.sec_ans;

    try {
        await userDetails.save();
        return res.redirect('home');
    } catch (err) {
        return res.render('editprofile');
    }
});

module.exports = router;

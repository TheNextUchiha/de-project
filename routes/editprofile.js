const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const router = express.Router();

const { authenticate } = require('./../middlewares/authenticate');
const { User } = require('./../server/models/user');
const { UserDetails } = require('./../server/models/userDetails');

router.get('/editprofile', authenticate, (req, res) => {
    res.render('editprofile');
});

router.post('/editprofile', authenticate, async (req, res) => {
    const body = _.pick(req.body, [
        'name',
        'mobile',
        'state',
        'address',
        'sec_que',
        'sec_ans',
    ]);
    const userID = new ObjectID(req.session.user.userID);

    let user;

    try {
        user = await User.findOne({ userID });
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
            userID: new ObjectID(user._id),
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
            console.log('ERROR WHILE INCREMENTING');
            return res.redirect('login');
        }
    } else {
        let userToBeUpdated;
        try {
            userToBeUpdated = await UserDetails.findOne({ userID });
        } catch (err) {
            console.log('ERROR: ', err);
            return res.redirect('editprofile');
        }

        userToBeUpdated.name = userToBeUpdated.name ? body.name : body.name;
        userToBeUpdated.mobilenum = userToBeUpdated.mobilenum
            ? body.mobile
            : body.mobile;
        userToBeUpdated.state = userToBeUpdated.state ? body.state : body.state;
        userToBeUpdated.address = userToBeUpdated.address
            ? body.address
            : body.address;
        userToBeUpdated.sec_que = userToBeUpdated.sec_que
            ? body.sec_que
            : body.sec_que;
        userToBeUpdated.sec_ans = userToBeUpdated.sec_ans
            ? body.sec_ans.toLowerCase()
            : body.sec_ans.toLowerCase();

        try {
            await userToBeUpdated.save();
            return res.redirect('home');
        } catch (err) {
            return res.render('editprofile');
        }
    }
});

module.exports = router;

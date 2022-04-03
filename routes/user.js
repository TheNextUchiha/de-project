const express = require('express');
const _ = require('lodash');
const { ObjectId } = require('mongodb');

const router = express.Router();

const { authenticate } = require('./../middlewares/authenticate');
const { User } = require('./../server/models/user');
const { UserDetails } = require('./../server/models/userDetails');
const { transporter } = require('./../utils/nodemailer');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv/config');
}

router.get('/users/:UserID', async (req, res) => {
    const userID = req.params.UserID;

    let user, userDetails;

    try {
        user = await User.findOne({ _id: userID });
    } catch (err) {
        return res.status(500).send({
            error: err,
            message: 'Error fetching the user.',
        });
    }

    if (!user) {
        return res.status(404).send('User not found!');
    }

    try {
        userDetails = await UserDetails.findOne({ userID });
    } catch (err) {
        return res.status(500).send({
            error: err,
            message: 'Error fetching the user details.',
        });
    }

    userDetails.qrcount += 1;

    try {
        await userDetails.save();
    } catch (err) {
        return res.status(500).json({
            error: err,
            message: 'Error saving the user: ',
        });
    }

    const mailOptions = {
        from: 'deproject237344@gmail.com <Lost & Found Center>',
        to: user.email,
        subject: 'Your QR Code was recently scanned!',
        text: 'Greetings from the Lost & Found Center!!\n\nYour QR Code was recently scanned by someone!\n\nHope to recieve a call soon by them.',
    };

    if (userDetails.qrcount > userDetails.qrcountprev) {
        try {
            transporter.sendMail(mailOptions);
        } catch (err) {
            return console.log('Error while sending mail: ', err);
        }

        // transporter.sendMail(mailOptions, (err, data) => {
        //     if (err) {
        //         return console.log('Error while sending mail: ', err);
        //     }
        // });

        try {
            await UserDetails.findOneAndUpdate(
                { userID },
                {
                    $inc: {
                        qrcountprev: 1,
                    },
                }
            );
        } catch (err) {
            console.log('ERROR: ', err);
            return res.redirect('home');
        }
    }

    return res.render('qr-result', {
        name: userDetails.name,
        mobilenum: userDetails.mobilenum,
        address: userDetails.address,
        email: user.email,
    });

    // UserDetails.findOne({userID}, (err, user) => {
    //     if(err) {
    //         return res.status(404).send();
    //     }
    //     User.findById(userID, (err, result) => {
    //         if(err) {
    //             return res.status(404).send();
    //         }

    //         const mailOptions = {
    //             from: 'deproject237344@gmail.com <Lost & Found Center>',
    //             to: result.email,
    //             subject: 'Your QR Code was recently scanned!',
    //             text: 'Greetings from the Lost & Found Center!!\n\nYour QR Code was recently scanned by someone!\n\nHope to recieve a call soon by them.'
    //         };

    //         if(user.qrcount > user.qrcountprev) {
    //             transporter.sendMail(mailOptions, (err, data) => {
    //                 if(err) {
    //                     return console.log('Error while sending mail: ', err);
    //                 }
    //                 console.log('MAIL SENT!');
    //             });

    //             UserDetails.findOneAndUpdate({userID}, {
    //                 $inc: {
    //                     qrcountprev: 1
    //                 }
    //             }, (err, result) => {
    //                 if(err) {
    //                     console.log('ERROR: ', err);
    //                     return res.redirect('home');
    //                 }
    //             });
    //         }

    //         res.render('qr-result', {
    //             name: user.name,
    //             mobilenum: user.mobilenum,
    //             address: user.address,
    //             email: result.email
    //         });
    //     });
    // });
});

module.exports = router;

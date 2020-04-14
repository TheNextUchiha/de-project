const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');
const crypto = require('crypto');
const format = require('biguint-format');

var QRSchema = new mongoose.Schema({
    userID: {
        type: ObjectID,
        // required: true,
        unique: true,
    },
    qr: []
});

var QR = mongoose.model('UserDetails', UserDetailsSchema, 'user_details');

module.exports = {UserDetails};
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');

var UserDetailsSchema = new mongoose.Schema({
    userID: {
        type: ObjectID,
        // required: true,
        unique: true,
    },
    name: {
        type: String,
        // required: true,
        trim: true,
        minlegth: 1
    },
    mobilenum: {
        type: Number,
        // required: true,
        unique: true,
        default: undefined,
        minlength: 10,
        maxlength: 10
    },
    state: {
        type: String,
        // required: true,
        default: undefined
    },
    address: {
        type: String,
        // required: true,
        trim: true,
        default: undefined
    },
    sec_que: {
        type: Number,
        // required: true,
        default: null
    },
    sec_ans: {
        type: String,
        // required: true,
        trim: true,
        default: undefined
    }
});

// UserSchema methods are used to apply methods on an instance of a User object.

// UserSchema.methods.comparePassword = (password, hash) => {
//     return bcrypt.compareSync(password, hash);
// };

// UserSchema statics is used to apply a method on the entire User Class/Schema.

UserDetailsSchema.pre('save', function(next) {
    var user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, resHash) => {
                user.password = resHash;
                next();
            });
        });
    } else {
        next();
    }
});

var UserDetails = mongoose.model('UserDetails', UserDetailsSchema, 'user_details');

module.exports = {UserDetails};
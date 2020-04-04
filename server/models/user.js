const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        required: true,
        trim: true,
        type: String,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email.'
        }
    },
    username: {
        required: true,
        trim: true,
        type: String,
        minlength: 1,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
});

// UserSchema methods are used to apply methods on an instance of a User object.
UserSchema.methods.comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

// UserSchema statics is used to apply a method on the entire User Class/Schema.

UserSchema.pre('save', function(next) {
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

var User = mongoose.model('User', UserSchema, 'users');

module.exports = {User};
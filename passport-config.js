const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./server/models/user');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy((username, password, done) => {
            username = username.toLowerCase();

            User.findOne({ username }, (err, doc) => {
                if (err) {
                    done(
                        err,
                        false,
                        req.flash('errorMessage', 'User not found')
                    );
                } else {
                    if (doc) {
                        var valid = doc.comparePassword(password, doc.password);
                        var userID = doc._id;
                        if (valid) {
                            done(null, { userID });
                        } else {
                            done(null, false);
                        }
                    } else {
                        done(null, false);
                    }
                }
            });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};

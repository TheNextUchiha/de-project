const LocalStrategy = require('passport-local').Strategy;
const {User} = require('./server/models/user');
console.log('PASSPORT CONFIG EXEC');
module.exports = (passport) => {

    passport.use(new LocalStrategy((username, password, done) => {
        username = username.toLowerCase();
        
        User.findOne({username}, (err, doc) => {
        
            if(err) {
                done(err, false, req.flash('errorMessage', 'User not found'));
            } else {
                if(doc) {
                    var valid = doc.comparePassword(password, doc.password);
                    if(valid) {
                        done(null, {
                            username,
                            password: doc.password
                        });
                    } else {
                        done(null, false);
                    }
                } else {
                    done(null, false);
                }
            }
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};
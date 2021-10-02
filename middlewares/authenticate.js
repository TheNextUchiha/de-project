const authenticate = (req, res, next) => {
    try {
        if (!req.session.user) {
            throw new Error('Please login');
        } else {
            next();
        }
    } catch (err) {
        res.render('login', {
            error: true,
            errorMessage: err,
        });
    }
};

module.exports = { authenticate };

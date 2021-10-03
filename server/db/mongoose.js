var mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv/config');
}

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
const localURI = 'mongodb://localhost:27017/LostAndFound';
const mongoURI = process.env.MONGO_URI;

try {
    mongoose.connect(mongoURI, {
        // For Online
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
    });

    // mongoose.connect(localURI, {      // For Offline
    //     useUnifiedTopology: true,
    //     useNewUrlParser: true,
    //     useFindAndModify: false
    // });
    console.log('DB Online!');
} catch (err) {
    console.log(
        'Error while connecting Online Mongo.\nSwitching to Offline Mongo.\nError for reference:',
        err
    );
}

module.exports = { mongoose };

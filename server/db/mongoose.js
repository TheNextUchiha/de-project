/*
Connection String:
Password -> fUFZNi6HKiPftVIe

mongodb+srv://farzanpira:fUFZNi6HKiPftVIe@lostandfoundcenter-gqm3k.mongodb.net/test?retryWrites=true&w=majority

Full Driver Example:

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://farzanpira:fUFZNi6HKiPftVIe@lostandfoundcenter-gqm3k.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

*/

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
const localURI = 'mongodb://localhost:27017/LostAndFound';
const mongoURI = 'mongodb+srv://farzanpira:fUFZNi6HKiPftVIe@lostandfoundcenter-gqm3k.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {  // For Online
    useUnifiedTopology: true, 
    useNewUrlParser: true,
    useFindAndModify: false
});

// mongoose.connect(localURI, {      // For Offline
//   useUnifiedTopology: true, 
//   useNewUrlParser: true,
//   useFindAndModify: false
// });

module.exports = {mongoose};
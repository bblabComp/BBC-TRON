var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var deposit = new Schema({
    fromAddress : String,
    toAddress : String,
    privateKey : String,
    hexAddress : String,
    status : ['PENDING', 'COMPLETED'],
    createdAt: Date,
    lastModified: Date
});

module.exports = mongoose.model('deposit', deposit);
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var transaction = new Schema({
    fromAddress : String,
    toAddress : String,
    amount : Number,
    transactionHash : String,
    status : ['PENDING', 'COMPLETED', 'ECONNREFUSED', 'ADDRESS_NOT_FOUND'],
    createdAt: Date,
    lastModified: Date
});

module.exports = mongoose.model('transaction', transaction);
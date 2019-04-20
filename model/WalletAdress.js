var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var walletAddress = new Schema({
    address : String,
    privateKey : String,
    publicKey : String,
    createAt : Date,
    lastModified : Date
});

module.exports = mongoose.model("walletAddress", walletAddress);   
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var wallet = new Schema({
    base58address : String,
    hexAddress : String,
    privateKey : String,
    publicKey : String,
    walletType : ['MAIN','USER'],
    createAt : Date,
    lastModified : Date
});

module.exports = mongoose.model("wallet", wallet);   
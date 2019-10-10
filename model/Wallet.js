var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var wallet = new Schema({
    base58address : String,
    hexAddress : String,
    addressType : ['ORG_ADDRESS','USER_ADDRESS'],
    createAt : Date,
    lastModified : Date
});

module.exports = mongoose.model("wallet", wallet);   
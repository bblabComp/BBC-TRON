var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TrxTimestamp = new Schema({
    lastProcessTimestamp : Number,
    createAt : Date,
    lastModified : Date
});

module.exports = mongoose.model("TrxTimestamp", TrxTimestamp);   

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var unSyncBlock = new Schema({
    blockNum:Number,
    status:['PENDING', 'CONFIRMED'],
    createdAt: Date,
    lastModified: Date
})

module.exports = mongoose.model("unSyncBlock", unSyncBlock);    
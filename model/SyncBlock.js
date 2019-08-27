var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var syncBlock = new Schema({
    blockNumber:Number,
    status:String,
    createdAt: Date,
    lastModified: Date
})

module.exports = mongoose.model("syncBlock", syncBlock);    
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var block = new Schema({
    blockNum:Number,
    status:String,
    createdAt: Date,
    lastModified: Date
})

module.exports = mongoose.model("block", block);    
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var alert = new Schema({
    id:Number,
    status:String,
    sendTo:String,
    createdAt: Date,
    lastModified: Date
})

module.exports = mongoose.model("alert", alert);    
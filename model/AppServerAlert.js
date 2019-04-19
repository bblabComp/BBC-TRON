var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var appServerAlert = new Schema({
    serverName:String,
    status:String,
    sendTo:String,
    createdAt: Date,
    lastModified: Date
})

module.exports = mongoose.model("appServerAlert", appServerAlert);    
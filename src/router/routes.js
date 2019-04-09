const express = require('express');
var query = require("../repository/QueryForAlert");
var QueryForDeposit = require('../repository/QueryForDeposit');
const router = express.Router();
const https = require('https');
const config = require("../../config/config");


router.get('/email-alert', function(req, res){
    query.fetchDataHandler(req, res);
});

router.post('/alert', function(req, res){
    console.log("in post call")
    query.postItem(req, res);
})

/*
* THREE WAY WE CAN CALL THE EXTERNAL API.
* 1. https
* 2. axios (to do this, use command to install- npm install axios@0.16.2)
* 3. request (to do this, use command to install- npm install request@2.81.0)
* @Generate address on tron server.
*/
router.get('/generate/address', function(req, res){
    https.get(config.TRON_URI+'/wallet/generateaddress', function(response){
        console.log("call api---------");
        let data = '';
        response.on('data', (item) => {
            data += item;
        });

        response.on('end', () => {
            res.json(JSON.parse(data));
        });
    }).on('error', (err) => {
        console.log('somthing goes wrong', err);
    });
});

/*
*
*
*
*/


module.exports = router;





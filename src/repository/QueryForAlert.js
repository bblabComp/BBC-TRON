const alert = require("../model/Alert");

exports.fetchData = (data) => {
    return new Promise((resolve, reject) => {
        alert.findOne({"id": data}, (err, alertStatus) => {
            if(err){
                reject({
                    success: false,
                    msg: "Something went wrong"
                });
            }else if(alertStatus == null || alertStatus.length == 0){
                //insert first element;
            }else{
                resolve({
                    success: false,
                    msg: "alert Status",
                    data:alertStatus
                });
            }
        });
    });
}

exports.fetchDataHandler = (req, res) => {
    this.fetchData(req.body.name).then(response => {
        // console.log("data==="+response.data);
        res.json(response.data);
    }).catch(error => {
        res.json(error);
    })
}

exports.postItem = (req, res) => {
    new alert({
        id:1,
        status:req.body.status,
        sendTo:req.body.sendTo,
        createdAt: new Date(),
        lastModified: new Date()
    }).save((err, item) => {
        if(err) throw err;
        console.log(item);
        res.json({
            data:item
        })
    });
}


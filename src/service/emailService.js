var NodeMailer = require('nodemailer');

var Transporter =  NodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth : {
        user : 'tf.bexchange@gmail.com',
        pass : 'Bblab@123'
    }
});

exports.onServerDown = () => {
    console.log("on main app server down.");
    Transporter.sendMail({
        from : 'nitesh.kumar@bblab.biz',
        to : 'tf.bexchange@gmail.com',
        subject : 'For Testing',
        html : '<div style="text-align: center; width: 50%;"><img src="https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/server_down_s4lk.svg"><br><font face="courier new, courier, monospace"><b>Your Main App server is not in Sync. During this down time all the incoming transaction save on the tron server database.</b></font></div>'
    }, function(err, item){
        if(err){
            console.log()
            throw err;
        }else{
            return item;
        }
    });
}

exports.onSuccessTransaction = (item) => {
    Transporter.sendMail({
        from : 'nitesh.kumar@bblab.biz',
        to : item.data.reciverEmail,
        subject : 'Receiving Tron Notification',
        html : '<div style="text-align: center; width: 50%;"><img src="https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/server_down_s4lk.svg"><br><font face="courier new, courier, monospace"><b>You have recently recived '+item.data.amount+' from address '+item.data.senderAddress+'</b></font></div>'
    }, function(err, res){
        if(err){
            throw err;
        }else{
            return item;
        }
    });
} 
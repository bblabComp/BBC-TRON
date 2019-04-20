var NodeMailer = require('nodemailer');

var Transporter =  NodeMailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth : {
        user : 'nitesh9818@gmail.com',
        pass : 'n8130960399h'
    }
});

exports.onServerDown = () => {
    Transporter.sendMail({
        from : '',
        to : '',
        subject : '',
        text : ''
    }, function(err, item){
        if(err){
            throw err;
        }else{
            return item;
        }
    });
}

exports.onSuccessTransaction = (item) => {
    Transporter.sendMail({
        from : '',
        to : '',
        subject : '',
        text : ''
    }, function(err, res){
        if(err){
            throw err;
        }else{
            return item;
        }
    })
} 
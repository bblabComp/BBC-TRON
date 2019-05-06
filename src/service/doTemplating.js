var EmailService = require('../service/emailService.js');
var TemplateEngine = require('../service/templateEngine.js');
var Promise = require('bluebird')

let users = [
    {
        name: 'Nitesh kumar',
        email: 'nitesh9818@gmail.com'
    }
]

exports.loadTemplate = () => {
    TemplateEngine.loadTemplate('down', users).then((result) => {
        return Promise.all(result.map((result) => {
            EmailService.onServerDown(result);
            console.log('Message sent :::: ')
        }));
    }).then(() => {
        console.log('Yay!');
    })
}

exports.sendTransactionSuccessAlert = () => {
    
}
var EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');
var Promise = require('bluebird');

exports.loadTemplate = (templateName, contexts) => {
    let template = new EmailTemplate(path.join('/home/bblab/Documents/code/BBC-TRON/', 'templates', templateName));
    return Promise.all(contexts.map((context) => {
        return new Promise((resolve, reject) => {
            template.render(context, (err, result) => {
                if(err) reject(err);
                else resolve({
                    email: result,
                    context,
                });
            });
        });
    }));
} 


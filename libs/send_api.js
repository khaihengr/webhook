const request = require('request');

require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const url = 'https://graph.facebook.com/v2.11/me/messages?access_token=' + PAGE_ACCESS_TOKEN;

function callSendAPI(sender_psid, response) {
    let request_body = {
        recipient: {
            id: sender_psid,
        },
        message: response,
    };
    request.post(url, {
        json: request_body,
    }, (err, res, body) => {
        console.log("body:",body);
        if (!err) {
            console.log('message sent!');
        } else {
            console.log('message can\'t send ' + err);
        }
    });
}
function sender_acction(sender_psid) {
    let request_body = {
        recipient: {
            id: sender_psid,
        },
        "sender_action":"typing_on"
    };
    request.post(url, {
        json: request_body,
    }, (err, res, body) => {
        console.log("body:",body);
        if (!err) {
            console.log('message sent!');
        } else {
            console.log('message can\'t send ' + err);
        }
    });
}
module.exports = {
    sender_acction,callSendAPI
}
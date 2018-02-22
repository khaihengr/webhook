'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const request = require('request');
const util = require('util');
const {generic} = require('./libs/templates');
require('dotenv').config();

// Routers
let getClendar = require('./utils/get_calendar');

// const Access_Token = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const url = 'https://graph.facebook.com/v2.11/me/messages?access_token=' + PAGE_ACCESS_TOKEN;
app.get('/', (req, res) => {
    console.log('logged');
    res.end('ok');
});
// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;
    if (received_message.text) {
        response = {
            'text': `You sent the message: "${received_message.text}". Now send me an image!`,
        };
    } else if (received_message.attachments) {
        console.log(util.inspect(received_message));
        let attachment_url = received_message.attachments[0].payload.url;
    }
    callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
    let payload = received_postback.payload;
    if (payload === 'yes') {
        response = {
            'text': 'Thank',
        };
    } else {
        response = {
            'text': 'Oops, try again',
        };
    }
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    let request_body = {
        recipient: {
            id: sender_psid,
        },
        message: response,
    };
    console.log(request_body);
    request.post(url, {
        json: request_body,
    }, (err, res, body) => {
        console.log(res.statusCode);
        console.log(body);
        if (!err) {
            console.log('message sent!');
        } else {
            console.log('message can\'t send ' + err);
        }
    });
}

app.post('/webhook', (req, res) => {
    let body = req.body;
    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        res.status(200).send('Event_Recieved');
    } else {
        res.sendStatus(404);
    }
});
app.get('/webhook', (req, res) => {
    let Verify_Token = 'alan';
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode == 'subscribe' && token == Verify_Token) {
            console.log('Webhook_Verified');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});
app.use(getClendar);
app.listen(process.env.PORT || 3000, () => {
    console.log('webhook is listen');
})
;
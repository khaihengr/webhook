'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const request = require('request');
const util = require('util');
const { generic } = require('./libs/templates');
const unicode = require("./helpers/unicode_convert");
const NLP = require("./libs/nlp_handing");
const mongoose = require("mongoose");
const M_student = require("./models/m_student");
const moment = require("moment");
const _ = require("lodash");
require("dotenv").config();

// Set default format for momentjs
moment.defaultFormat="DD/MM/YYYY"

mongoose.Promise = global.Promise;
// let MONGO_URI = process.env.MONGO_URI;
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('DB is connected ...')
}).catch(()=>{
    console.log("error");
});

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
    try{
        let response;
        if (received_message.text) {
            let message = unicode.unicode_convert(received_message.text);
            let cmd_data = NLP.NLP_Handing(message);
            switch (cmd_data.state) {
                case "signin": {
                    let account_info = cmd.data;
                    response = {
                        'text': `Bạn đã đăng nhập với tài khoản:
                        user: ${account_info.username},
                        pass: ${account_info.password}
                        `
                    };
                    getClendar.get_calendar(account_info.username,account_info.password,(data)=>{
                        let student={
                            _id         : sender_psid,
                            student_id  : account_info.username,
                            password    : account_info.password,
                            calendar    : data
                        };
                        M_student.save_data(student);
                    })
                    break;    
                }
                case "asking": {
                    let cmd = cmd_data.data;
                    console.log(cmd);
                    M_student.get_data(sender_psid, (err, res) => {
                        if (res) {
                            let data = res.calendar;
                            let notif=[];
                            data.forEach(subjects => {
                                let subject = subjects;
                                subjects.datetime.forEach((s, i) => {
                                    if (moment(cmd, "DD/MM/YYYY").isSameOrAfter(moment(s.startDate, "DD/MM/YYYY").format("YYYY-MM-DD")) && 
                                    moment(cmd, "DD/MM/YYYY").isSameOrBefore(moment(s.endDate, "DD/MM/YYYY").format("YYYY-MM-DD"))
                                    && (moment(cmd, "DD/MM/YYYY").weekday() + 1) == s.weekday) {
                                        let room = {}
                                        room = subject.place.find(p => {
                                            if (new RegExp(i, "gi").test(p.room)) {
                                                return p;
                                            }
                                        });
                                        if (!room) {
                                            room = subject.place[0].room;
                                            notif.push({
                                                name: subject.name,
                                                stDate: s.stDate,
                                                place: room
                                            })
                                        } else {
                                            notif.push({
                                                name: subject.name,
                                                stDate: s.stDate,
                                                place: room.room
                                            })
                                        }
                                        
                                    }
                                })
                            })
                            setTimeout(() => {
                                if (notif.length > 0) {
                                    notif.forEach(mes => {
                                        mes.name = mes.name.substring(0, mes.name.indexOf("-"));
                                        response = {
                                            'text': `học phần ${mes.name} tiết ${mes.stDate} tại ${mes.place} :)`
                                        }
                                        
                                        callSendAPI(sender_psid, response);
                                    });
                                    
                                } else {
                                    response = {
                                        'text': `Lịch học trống :3`
                                    }
                                    callSendAPI(sender_psid, response);
                                }
                                
                            }, 500);
                        }
                        
                    });
                    break;
                }    
                default: {
                    response = {
                        'text': 'no match anything',
                        "quick_replies":[
                            {
                                "content_type":"lịch học hôm nay",
                                "title":"Hôm nay",
                                "payload":"<POSTBACK_PAYLOAD>"
                            },
                        ]
                    }
                }    
            }
            callSendAPI(sender_psid, response);
        } else if (received_message.attachments) {
            console.log(util.inspect(received_message));
            let attachment_url = received_message.attachments[0].payload.url;
        }
    }catch(err){
        let response = {
            'text': err.message
        };
        callSendAPI(sender_psid, response);
    }
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
        console.log("body:",body);
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
app.listen(process.env.PORT || 3000, () => {
    console.log('webhook is listen');
});
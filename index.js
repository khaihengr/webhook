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
const quick_reply = require("./libs/quick_reply");
const {sender_acction,callSendAPI} = require("./libs/send_api");
require("dotenv").config();

// Set default format for momentjs
moment.defaultFormat="DD/MM/YYYY"

mongoose.Promise = global.Promise;
// let MONGO_URI = process.env.MONGO_URI;
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
    sender_acction();
    try{
        let response;
        if (received_message.quick_reply) {
            let message = unicode.unicode_convert(received_message.quick_reply.payload);
            let cmd_data = NLP.NLP_Handing(message);
            switch (cmd_data.state) {
                case "signin": {
                    let account_info = cmd.data;
                    response = {
                        'text': `Bạn gửi yêu cầu đăng nhập tài khoản:
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
                                        let rom_id = i + 1;
                                        room = subject.place.find(p => {
                                            console.log(i);
                                            if (new RegExp(rom_id, "gi").test(p.id)) {
                                                return p;
                                            }
                                        });
                                        try {
                                            notif.push({
                                                name: subject.name,
                                                stDate: s.stDate,
                                                place: room.room
                                            })
                                        }catch(e){
                                            room = subject.place[0];
                                            notif.push({
                                                name: subject.name,
                                                stDate: s.stDate,
                                                place: room
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
                                            'text': `học phần ${mes.name} tiết ${mes.stDate} tại ${mes.place}`,
                                            "quick_replies":[
                                                quick_reply.text_reply
                                            ]
                                        }
                                        
                                        callSendAPI(sender_psid, response);
                                    });
                                    
                                } else {
                                    response = {
                                        'text': `Lịch học trống :3`,
                                        "quick_replies":[
                                            quick_reply.text_reply
                                        ]
                                    }
                                    callSendAPI(sender_psid, response);
                                }
                                
                            }, 500);
                        }
                        
                    });
                    break;
                }    
                case "help": {
                    response = {
                        'text': `Bạn cần đăng nhập để xem được lịch học, sau khi đăng nhập thành công bạn có thể yêu cầu Bot cho bạn xem lịch học
                                Nếu bạn đã đăng nhập bạn có thể hỏi bot về  lịch học của mình ví dụ: lịch học hôm nay, lịch học hôm qua, lịch học ngày này tuần sau ...
                        `,
                        "quick_replies":[
                            quick_reply.text_reply
                        ]
                    };
                    break;
                }        
            
                default: {
                    response = {
                        'text': 'Bạn có thể chọn help trong menu hoặc gõ help để được trợ giúp. Nếu bạn đã đăng nhập có thể chọn các chức năng bên dưới',
                        "quick_replies":[
                            quick_reply.text_reply
                        ]
                    }
                }    
            }
            callSendAPI(sender_psid, response);
        } else {
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
                                        let rom_id = i + 1;
                                        room = subject.place.find(p => {
                                            if (new RegExp(rom_id, "gi").test(p.room)) {
                                                return p;
                                            }
                                        });
                                        try {
                                            notif.push({
                                                name: subject.name,
                                                stDate: s.stDate,
                                                place: room.room
                                            })
                                        }catch(e){
                                            room = subject.place[0];
                                            notif.push({
                                                name: subject.name,
                                                stDate: s.stDate,
                                                place: room
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
                        'text': 'Xin lỗi vì bất tiện này, tôi chưa hiểu yêu cầu của bạn. Bạn có thể chọn một trong các quick replies phía dưới',
                        "quick_replies":quick_reply.text_reply
                    }
                }    
            }
            callSendAPI(sender_psid, response);
        }
        if (received_message.attachments) {
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
    let message = unicode.unicode_convert(payload);
    let cmd_data = NLP.NLP_Handing(message);
    switch (cmd_data.state) {
        case "started": {
            response = {
                'text': `Chào mừng bạn đến với Calendar Bot hãy đăng nhập để Bot có thể giúp đỡ bạn nhiều hơn
                    `
            };
        }
        case "signin": {
                    response = {
                        'text': `Bạn đã đăng nhập bằng cú pháp như sau:
                            SIGNIN[USER-PASS]
                            Với USER và PASS là thông tin đăng nhập trên website của trường của bạn
                            `
                    };
        }
        case "update": {
            response = {
                'text': `Tính năng đang được phát triển. Sẽ có thông báo khi hoàn thành`
            };
            break;    
        }  
        case "help": {
            response = {
                'text': `Bạn cần đăng nhập để xem được lịch học, sau khi đăng nhập thành công bạn có thể yêu cầu Bot cho bạn xem lịch học
                        Nếu bạn đã đăng nhập bạn có thể hỏi bot về  lịch học của mình ví dụ: lịch học hôm nay, lịch học hôm qua, lịch học ngày này tuần sau ...
                `
            };
            break;
        }        

     }
    
    callSendAPI(sender_psid, response);
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
"use strict";
const
express = require("express"),
bodyParser = require("body-parser"),
app = express().use(bodyParser.json());

app.get("/", (req, res) => {
    console.log("logged");
    res.end("ok");
})
app.post("/webhook", (req, res) => {
    let body = req.body;
    console.log(body);
    if (body.object === "page") {
        body.entry.forEach(entry => {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        })
        res.status(200).send("Event_Recieved")
    } else {
        res.sendStatus(404);
    }
})
app.get("/webhook", (req, res) => {
    let Verify_Token = "alan";
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode == "subscribe" && token == Verify_Token) {
            console.log("Webhook_Verified");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
})
app.listen(process.env.PORT || 3000, () => {
    console.log("webhook is listen")
})
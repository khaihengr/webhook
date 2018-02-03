
let web_url_btn = (title, url) => {
    return {
        "type": "web_url",
        "url": url,
        "title": title,
    }
}

let postback_btn = (title,payload)=>{
    return {
        "type": "postback",
        "title": title,
        "payload":payload
    }
}

let share_btn = (title,subtitle,image_url,default_action_url,btn_url) => {
    return {
        "type": "element_share",
    "share_contents": { 
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": title,
                        "subtitle": subtitle,
                        "image_url": image_url,
                        "default_action": {
                            "type": "web_url",
                            "url": default_action_url
                        },
                        "buttons": [
                            btn_url
                        ]
                    }
                ]
            }
        }
    }
    }
}
let support_btn = (title,phone_number) => {
   return {
        "type":"phone_number",
        "title":title,
        "payload":phone_number
      }
}
let login_btn = (url) => {
    return {
        "type": "account_link",
        "url": url
      }
}
let logout_btn = () => {
    return {
        "type": "account_unlink"
      }
}
module.exports = {
    web_url_btn,postback_btn,share_btn
}
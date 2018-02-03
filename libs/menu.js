/**
 * 
 * @param {string} title title for menu
 * @param {array} button up to three buttons in array
 */
let persistent = (title,button) => {
    return {
        "persistent_menu":[
            {
                "locale":"default",
                "composer_input_disabled": true,
                "call_to_actions":[
                    {
                        "title":"My Account",
                        "type":"nested",
                        "call_to_actions":[
                            {
                                "title":"Pay Bill",
                                "type":"postback",
                                "payload":"PAYBILL_PAYLOAD"
                            },
                            {
                                "type":"web_url",
                                "title":"Latest News",
                                "url":"https://www.messenger.com/",
                                "webview_height_ratio":"full"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

module.exports = {
    
}
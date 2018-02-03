let broadcast_messages = (msg_obj)=>{
      return {  "messages": [
            msg_obj
        ]
    }
}
let broadcast_message = (fallback_text) => {
    return {
        "dynamic_text": {
          "text": "Hi, {{first_name}}!",
          "fallback_text": fallback_text
        } 
      }
}
let sending_broadcast_message = (broadcast_message_id,notification_type,tag) => {
    return {    
        "message_creative_id": broadcast_message_id,
        "notification_type": notification_type,
        "tag": tag
      }
}
module.exports = {}
/**
 *
 * @param {string} title
 * @param {string} subtitle
 * @param {string} image_url
 * @param {array} obj_btn - list of button {"type":"string","title":"yes","payload":"yes"}
 */
let generic = (title, subtitle, image_url, button=[]) => {

    return {
        "title": title,
        "subtitle": subtitle,
        "image_url": image_url,
        "buttons": button
    }
}
/**
 * 
 * @param {string} template_name - name of type tempale (generic)
 * @param {array} template_type - list of template_type (generic)
 */
let template_general = (template_name,template_type=[]) => {
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": template_name,
                "elements": template_type
            }
        }
    }
}
module.exports = {
    generic,template_general
}
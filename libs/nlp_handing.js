/** 
 * @author khai hoang
 * @email khaihoangdev@gmail.com
 * @description nlp handing core
*/

let _ = require("lodash");
let moment = require("moment");

/**
 * @author khai hoang
 * @email khaihoangdev@gmail.com
 * @param {String} message 
 * @returns object{state:"<state>",data:<data>}
 * @returns object{state:"sign",data:{username,password}}
 * @returns object{state:"asking",data:"cmd"}
 */
let NLP_Handing = (message) => {
    if (message == "signin") {
        return {
            state:"signin",
            data:""
        }
    }
    if(is_login_syntax(message)){
        return {
            state:"signin",
            data:login_handing(message)
        }
    }
    if(is_asking_syntax(message)){
        return{
            state:"asking",
            data: asking_syntax(message)
        }
    }
    if (is_update_asking(message)) {
        return{
            state:"update",
            data: ""
        }
    }
    if (is_get_started(message)) {
        return{
            state:"started",
            data: ""
        }
    }
    if (is_greeting_syntax(message)) {
        return{
            state:"greeting",
            data: ""
        }
    }
    if (is_help_syntax(message)) {
        return{
            state:"help",
            data: ""
        }
    }
    return message;
};
let is_help_syntax=(message)  => {
    let pattern = new RegExp(/.*(help|giup toi|giup voi|ho voi|can ban giup|giup do)/,"g");
    return pattern.test(message);
}
let is_greeting_syntax=(message)  => {
    let pattern = new RegExp(/.*(hello|xin chao|chao ban|chao|what's up|bello|hallo|bot khoe khong|ngay moi tot lanh)/,"g");
    return pattern.test(message);
}
let is_update_asking = (message) => {
    let pattern = new RegExp(/.*(update)/,"g");
    return pattern.test(message);
}
let is_get_started = (message) => {
    let pattern = new RegExp(/.*(get_started|bat dau|getstarted)/,"g");
    return pattern.test(message);
}
let asking_syntax = (message) => {
    
    let pattern = new RegExp(/(ngay nay tuan sau|ngay nay thang sau|ngay nay tuan truoc|ngay nay thang truoc|hom kia|hom qua|hom nay|ngay mai|ngay kia|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}|\d{1,2})/, "gi");
    let cmd = pattern.exec(message);
    console.log(cmd);
    if (typeof cmd!=null && typeof cmd[0] != null) {
        if (is_date(cmd[0])) return cmd[0];
        return convert_string_to_date(cmd[0]);
    }
    return message;
}

let convert_string_to_date=(sdate)=>{
    switch (sdate) {
        case "ngay nay thang truoc": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").subtract(1, 'months').format('DD/MM/YYYY');
            return match_date;
        }
        case "ngay nay tuan truoc": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").subtract(7, 'days').format('DD/MM/YYYY');
            return match_date;
        }
        case "hom qua": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").subtract(1, 'days').format('DD/MM/YYYY');
            return match_date;
        }
        case "hom kia": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").subtract(2, 'days').format('DD/MM/YYYY');
            return match_date;
        }
        case "hom nay": {
            let cur_date = moment().format("DD/MM/YYYY");
            return cur_date;
        }
        case "ngay mai": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").add(1, 'days').format('DD/MM/YYYY');
            return match_date;
        }    
        case "ngay kia": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").add(2, 'days').format('DD/MM/YYYY');
            return match_date;
        }
        case "ngay nay tuan sau": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").add(7, 'day').format('DD/MM/YYYY');
            return match_date;
        }    
        case "ngay nay thang sau": {
            let cur_date = moment().format("DD/MM/YYYY");
            let match_date = moment(cur_date, "DD/MM/YYYY").add(1, 'months').format('DD/MM/YYYY');
            return match_date;
        }    
    
    }
}
let is_date = (date) => {
    let pattern = new RegExp(/\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}|\d{1,2}/,"g");
    return pattern.test(date);
}
/**
 * @author khai hoang
 * @email khaihoangdev@gmail.com
 * @function checking the syntax is asking
 */

let is_asking_syntax=(message)=>{
    let pattern = new RegExp(/.*(xem lich|lich hoc|lich)/,"g");
    return pattern.test(message);
}

/**
 * @author : Khai Hoang
 * @param {String} message 
 * @name : is_login_ syntax
 */
let is_login_syntax = (message)=>{
    let pattern = new RegExp(/sign\[(.+)\-(.+)\]/,"gi");
    return pattern.test(message);
}

/**
 * 
 * @author  : Khai Hoang
 * @name    : login_handing
 * @email   : khaihoangdev@gmail.com
 * @param {String} message 
 * @returns {Array} account info
 */
let login_handing = function (message){
    let pattern = new RegExp(/sign\[(.+)\-(.+)\]/,"gi");
    let results = pattern.exec(message);
    let data    = {
        username : results[1],
        password : results[2]
    }
    return data;
}

module.exports = {
    NLP_Handing
};
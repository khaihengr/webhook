let request = require('request');
let cheerio = require('cheerio');
let router = require('express').Router();
let md5 = require('md5');
let axios = require("axios");
let fs = require("fs");
let got = require("got");
let _ = require("lodash");

// Confirm request
request = request.defaults({jar: true})

let uri = {
    generate:'http://dangkytinchi.ictu.edu.vn/kcntt/Login.aspx',
    sigin: 'http://dangkytinchi.ictu.edu.vn/kcntt/(S(udrkqnylt44t0tqc0x2zgiy3))/Login.aspx',
    calendar: 'http://dangkytinchi.ictu.edu.vn/kcntt/(S(fldncoajip5xjrua4lhv4xs4))/Reports/Form/StudentTimeTable.aspx',
    
};
let split_date = (dt) => {
    var fix = dt.replace(/ /ig, "")
    var arr = fix.split("Từ").filter(item => item != "");
    var fix_arr = arr.map(item => {
        if (item.indexOf("Chủnhật") < 0) {
            var startDate = item.substring(0, 10);
            var endDate = item.substring(13, 23);
            var id = item.substring(25, 26);
            var _weekday = item.lastIndexOf("Thứ");
            var weekday = item.substring(_weekday + 3, _weekday + 4);
            var _endSTDate = item.lastIndexOf("(");
            var stDate = item.substring(_weekday + 8, _endSTDate);
            var cate = item.substring(_endSTDate + 1, _endSTDate + 3);
        } else {
            var startDate = item.substring(0, 10);
            var endDate = item.substring(13, 23);
            var id = item.substring(25, 26);
            var _weekday = item.lastIndexOf("Chủnhật");
            var weekday = "7";
            var _endSTDate = item.lastIndexOf("(");
            var stDate = item.substring(_weekday + 11, _endSTDate);
            var cate = item.substring(_endSTDate + 1, _endSTDate + 3);
        }
        return { startDate, endDate, id, weekday, stDate, cate }
    })
    return fix_arr;
}
let split_place = (dt)=>{
    dt = dt.split("(").filter(item=>item!="");
    dt = dt.map(item=>{
        items = item.split(") ");
        return {
            id:items[0],room:items[1]
        }
    })
    return dt;
}
router.post('/getcalendar', (req, res) => {
    let form = init_form({username:"DTC15HD4802010110",password:"hoangkhaj"});
    
    (async () => {
        try {
            const response = await got(uri.generate);
            uri.sigin=response.redirectUrls[0];
            console.log(uri.sigin);
            request.post(uri.sigin,{
                "Content-type": "application/x-www-form-urlencoded",
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36",
                "form":form
            },(e,r,b)=>{
                request.get(uri.calendar,
                    (e,r,b)=>{
                        let $ = cheerio.load(b);
                        let count = $("#gridRegistered > tbody > tr").length;
                        let name = $("#gridRegistered > tbody > tr:nth-child(2) > td:nth-child(2)").text();
                        let data = [];
                        for(let i=2;i<count;i++){
                            let name = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(2)`).text(),/[\r\n\t]+/ig,"");
                            let id = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(3)`).text(),/[\r\n\t]+/ig,"");
                            let  datetime= _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(4)`).text(),/[\r\n\t]+/ig,"");
                            let place = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(5)`).text(),/[\r\n\t]+/ig,"");
                            let lecturer = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(6)`).text(),/[\r\n\t]+/ig,"");
                            let numerator = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(7)`).text(),/[\r\n\t]+/ig,"");
                            let signNumerator = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(8)`).text(),/[\r\n\t]+/ig,"");
                            let numberOfCredit = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(9)`).text(),/[\r\n\t]+/ig,"");
                            let fee = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(10)`).text(),/[\r\n\t]+/ig,"");
                            let note = _.replace($(`#gridRegistered > tbody > tr:nth-child(${i}) > td:nth-child(11)`).text(), /[\r\n\t]+/ig, "");
                            datetime = split_date(datetime);
                            place = split_place(place);
                            data.push({id,name,datetime,place,lecturer,numberOfCredit,numerator,signNumerator,fee,note});
                        }
                        setTimeout(()=>{
                            res.json(data);
                        },500)
                    })
                })
                
            } catch (error) {
                console.log(error.response.body);
                //=> 'Internal server error ...'
            }
        })();
        
    });
    let init_form = (user) => {
        let username = user.username;
        let password = md5(user.password);
        return {
            __EVENTTARGET: '',
            __EVENTARGUMENT: '',
            __LASTFOCUS: '',
            __VIEWSTATE: '/wEPDwUKMTkwNDg4MTQ5MQ8WAh4DVVJMBS9odHRwOi8vZGFuZ2t5dGluY2hpLmljdHUuZWR1LnZuL2tjbnR0L0hvbWUuYXNweBYCAgEPZBYKZg9kFgoCAQ8PFgIeBFRleHQFQFRSxq/hu5xORyDEkOG6oEkgSOG7jEMgQ8OUTkcgTkdI4buGIFRIw5RORyBUSU4gJiBUUlVZ4buATiBUSMOUTkdkZAICD2QWAmYPDxYEHwEFDcSQxINuZyBuaOG6rXAeEENhdXNlc1ZhbGlkYXRpb25oZGQCAw8QDxYGHg1EYXRhVGV4dEZpZWxkBQZreWhpZXUeDkRhdGFWYWx1ZUZpZWxkBQJJRB4LXyFEYXRhQm91bmRnZBAVAQJWThUBIDAxMDUyN0VGQkVCODRCQ0E4OTE5MzIxQ0ZENUMzQTM0FCsDAWcWAWZkAgQPDxYCHghJbWFnZVVybAUaL2tjbnR0L0ltYWdlcy9Vc2VySW5mby5naWZkZAIFD2QWBgIBDw8WAh8BBQZLaMOhY2hkZAIDDw8WAh8BZWRkAgcPDxYCHgdWaXNpYmxlaGRkAgIPZBYEAgMPD2QWAh4Gb25ibHVyBQptZDUodGhpcyk7ZAIHDw8WAh8BZWRkAgQPDxYCHwdoZGQCBg8PFgIfB2hkFgYCAQ8PZBYCHwgFCm1kNSh0aGlzKTtkAgUPD2QWAh8IBQptZDUodGhpcyk7ZAIJDw9kFgIfCAUKbWQ1KHRoaXMpO2QCCw9kFghmDw8WAh8BBSswMjA4IDMgODQ2MjcxIEfhu41pIHbDoG8gZ2nhu50gaMOgbmggY2jDrW5oZGQCAQ9kFgJmDw8WAh8CaGRkAgIPZBYCZg8PFgQfAQUNxJDEg25nIG5o4bqtcB8CaGRkAgMPDxYCHwEFugU8YSBocmVmPSIjIiBvbmNsaWNrPSJqYXZhc2NyaXB0OndpbmRvdy5wcmludCgpIj48ZGl2IHN0eWxlPSJGTE9BVDpsZWZ0Ij4JPGltZyBzcmM9Ii9rY250dC9pbWFnZXMvcHJpbnQucG5nIiBib3JkZXI9IjAiPjwvZGl2PjxkaXYgc3R5bGU9IkZMT0FUOmxlZnQ7UEFERElORy1UT1A6NnB4Ij5JbiB0cmFuZyBuw6B5PC9kaXY+PC9hPjxhIGhyZWY9Im1haWx0bzo/c3ViamVjdD1IZSB0aG9uZyB0aG9uZyB0aW4gSVUmYW1wO2JvZHk9aHR0cDovL2RhbmdreXRpbmNoaS5pY3R1LmVkdS52bi9rY250dC9Mb2dpbi5hc3B4P3VybD1odHRwOi8vZGFuZ2t5dGluY2hpLmljdHUuZWR1LnZuL2tjbnR0L0hvbWUuYXNweCI+PGRpdiBzdHlsZT0iRkxPQVQ6bGVmdCI+PGltZyBzcmM9Ii9rY250dC9pbWFnZXMvc2VuZGVtYWlsLnBuZyIgIGJvcmRlcj0iMCI+PC9kaXY+PGRpdiBzdHlsZT0iRkxPQVQ6bGVmdDtQQURESU5HLVRPUDo2cHgiPkfhu61pIGVtYWlsIHRyYW5nIG7DoHk8L2Rpdj48L2E+PGEgaHJlZj0iIyIgb25jbGljaz0iamF2YXNjcmlwdDphZGRmYXYoKSI+PGRpdiBzdHlsZT0iRkxPQVQ6bGVmdCI+PGltZyBzcmM9Ii9rY250dC9pbWFnZXMvYWRkdG9mYXZvcml0ZXMucG5nIiAgYm9yZGVyPSIwIj48L2Rpdj48ZGl2IHN0eWxlPSJGTE9BVDpsZWZ0O1BBRERJTkctVE9QOjZweCI+VGjDqm0gdsOgbyDGsGEgdGjDrWNoPC9kaXY+PC9hPmRkZCjPoeQ4pdHGdW2SO8ZgGLkSMgZcMXcnMlKDk1W1VHlA',
            __VIEWSTATEGENERATOR: '92FB0661',
            __EVENTVALIDATION: '/wEWDwLT/oPZBgLd496dDQLX/aiNAgL654PzBALrxLG+CQKDwY3TBQKe0sf1DwKl1bKzCQK1qbSRCwLCi9reAwL+p9jdAwKRzvmKCgKtrZmsAQLg7croCgLqsK77BaOxHj0iZAQLYQC9YEU8rgJzdx5ivBg9hdGP3lYN7ZnV',
            PageHeader1$drpNgonNgu: '010527EFBEB84BCA8919321CFD5C3A34',
            PageHeader1$hidisNotify: 0,
            PageHeader1$hidValueNotify: '.',
            txtUserName: username,
            txtPassword: password,
            btnSubmit: 'Đăng nhập',
            hidUserId: '',
            hidUserFullName: '',
            hidTrainingSystemId: '',
        };
    };
    module.exports = router;
    
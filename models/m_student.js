let mongoose = require("mongoose");
let Schame = mongoose.Schema;

let student = new Schame({
    _id: String,
    student_id:String,
    password:String,
    calendar:[
        {
            termID: String,
            name: String,
            datetime: [],
            place: [],
            lecture: String,
            numberOfCredit: Number,
            numerator: Number,
            signNumerator: Number,
            fee: Number,
            note:String
        }
    ]
});

mongoose.model('student', student);

let save_data = (data)=>{
    console.log(data);
    let STUDENT = mongoose.model("student");
    STUDENT.findById(data._id).then(res => {
        if (!res) {
            new STUDENT(data).save().then(res=>{
                console.log(res);
            });
            return;
        } else {
            console.log("it've already declared before");
        }
    })
    
}
let get_data = (_id,cb) => {
    let STUDENT = mongoose.model('student');
    STUDENT.findOne({ _id:_id }).then(res => {
        if (res) {
            cb(null,res);
            return;
        } else {
            console.log("no match any data");
        }
    })
}
module.exports={save_data,get_data}
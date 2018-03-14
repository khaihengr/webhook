let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let NLP_RULE = new Schema({
    key: String,
    answer: [],
    default_answer: {
        type: Number,
        default: -1
    }
});

mongoose.model('npl_rule', NLP_RULE);

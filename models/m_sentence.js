let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let Sentence = new Schema({
    type: String,
    answer: [],
    default: {
        type: Number,
        default: -1
    }
});
mongoose.model('sentence', Sentence);
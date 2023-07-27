const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const downloadListSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});



module.exports = mongoose.model('DownloadList', downloadListSchema);


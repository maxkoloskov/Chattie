var mongoose = require('../lib/mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var MessageSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true,
        required: true
    },
    owner: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: ObjectId,
        ref: 'Channel',
        required: true
    },
    created: {
        type: Date,
        default: Date.now,
        index: true
    }
});

MessageSchema.index({ text: 'text', channel: 1, created: -1, _id: 1 });

MessageSchema.method('toJSON', function() {
    return {
        id: this._id,
        text: this.text,
        channel: this.channel,
        created: this.created,
        owner: this.owner
    };
});

module.exports = mongoose.model('Message', MessageSchema);
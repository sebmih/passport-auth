var mongoose = require('mongoose');

module.exports = mongoose.model('Meeting',{
	id:   String,
    name: String,
    objective: String,
    startTime: Date,
    endTime: Date,
    participant: String
});

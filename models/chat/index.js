const mongoose = require('mongoose');

const schema = {
	message: String,
	userFrom: String,
	userTo: String,
	isWhisper: Boolean
};

module.exports = mongoose.model('chat', schema);
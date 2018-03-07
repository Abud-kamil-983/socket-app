var mongoose = require('mongoose');
var  Schema = mongoose.Schema;

var ChatSchema = new Schema({
  sender: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

mongoose.model('Chat', ChatSchema);
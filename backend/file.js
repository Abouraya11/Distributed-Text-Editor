const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  data_entry: {
    type: Object,
    required: true,
  },
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);
module.exports = File;
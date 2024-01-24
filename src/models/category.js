const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["MILK", "ASSETS", "OTHER"],
    default : "OTHER"
  },
} , 

{ timestamps: true , toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

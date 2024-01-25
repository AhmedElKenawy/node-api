// src/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  address  : {
    type: String,
  },
  city  : {
    type: String,
  },
  credit  : {
    type: Number,
    default: 0
  },
  deposits  : {
    type: Number,
    default: 0
  },
  debit  : {
    type: Number,
    default: 0
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: false,
  },
  
},
{ timestamps: true , toJSON: {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
},}
);

const User = mongoose.model('User', userSchema);

module.exports = User;

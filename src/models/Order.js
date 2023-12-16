// src/models/Order.js

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: Number,
    },
    date: {
      type: Date,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },
    paid: {
      type: Number,
      default: 0,
    },

    remains: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

orderSchema.pre('save', async function (next) {
  try {
    if (!this.orderNumber) {
      // If orderNumber is not provided, generate it based on the count
      const count = await this.constructor.countDocuments();
      this.orderNumber = count + 1;
    }
    next();
  } catch (error) {
    next(error);
  }
});
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

// src/models/Order.js

const mongoose = require("mongoose");
const User = require("./User");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    period: {
      type: String,
      required: true,
      enum: ["AM", "PM"],
      default: "AM",
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

orderSchema.pre("save", async function (next) {
  try {
    if (!this.orderNumber) {
      const count = await this.constructor.countDocuments();
      this.orderNumber = count + 1;
    }
    const user = await User.findById(this.userId);
    if (!user) {
      return next(new Error("User not found"));
    }
    if (!user.deposits) user.deposits = 0;
    const orderRemains = this.remains || 0  - user.deposits;
    user.deposits -= this.remains;
    await user.save();
    this.remains = orderRemains;

    next();
  } catch (error) {
    next(error);
  }
});
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

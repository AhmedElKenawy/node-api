// src/controllers/orderController.js

const Order = require("../models/Order");
const moment = require("moment");

// Controller for handling order-related operations
const getWeeklyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Convert string dates to MongoDB ISODate
    const startISODate = startDate ? new Date(moment('2023-12-16T10:53:12.823+00:00').startOf("day")) : new Date();
    const endISODate = endDate ? new Date(moment("2023-12-22T10:53:12.823+00:00").endOf("day")) : new Date();
    console.log("===?");
    const weeklyReport = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: startISODate,
            $lte: endISODate,
          },
        },
      },
      {
        $group: {
          _id: "$userId",
          total: { $sum: "$total" },
          totalPaid: { $sum: "$paid" },
          totalRemains: { $sum: "$remains" },
          sat: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 7] }, "$price", 0] } },
          sun: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 1] }, "$price", 0] } },
          mon: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 2] }, "$price", 0] } },
          tue: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 3] }, "$price", 0] } },
          wed: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 4] }, "$price", 0] } },
          thu: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 5] }, "$price", 0] } },
          fri: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 6] }, "$price", 0] } },
        },
      },
      {
        $lookup: {
          from: "users", // Assuming the collection name is 'users'
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          name: "$user.name", // Assuming 'username' is the field representing the user's name
          total: "$total",
          totalPaid: "$totalPaid",
          totalRemains: "$totalRemains",
          sat: "$sat",
          sun: "$sun",
          mon: "$mon",
          tue: "$tue",
          wed: "$wed",
          thu: "$thu",
          fri: "$fri",
        },
      },
    ]);

    // Calculate the totals for all users
    const totalReport = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: startISODate,
            $lte: endISODate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          totalPaid: { $sum: "$paid" },
          totalRemains: { $sum: "$remains" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    const [total] = totalReport;

    res.json({ userReport: weeklyReport, report: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all orders with pagination
const getAllOrders = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;

  try {
    if (pageSize) {
      let orders;
      const skip = (page - 1) * pageSize;
      orders = await Order.find().populate(populateOrder).skip(skip).limit(Number(pageSize));
      const totalCount = await Order.countDocuments();
      res.json({ result: mapOrders(orders), totalCount });
    } else {
      orders = await Order.find().populate(populateOrder);
      res.json(mapOrders(orders));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  const { userId, date, quantity, paid, price } = req.body;
  try {
    const total = quantity * price;
    const _order = {
      userId,
      date,
      quantity,
      total,
      price,
      paid,
      remains: total - paid,
    };
    const newOrder = new Order(_order);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update order by ID
const updateOrderById = async (req, res) => {
  const { id } = req.params;
  const { userId, date, quantity, price, paid } = req.body;
  const total = price * quantity;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { userId, date, quantity, total, price, paid, remains: total - paid },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const populateOrder = {
  path: "userId",
  model: "User",
  select: "name phone",
  options: { lean: true }, // Convert to plain JavaScript objects for easier manipulation
};
const mapOrders = (orders) => {
  return orders.map((order) => {
    return {
      ...order.toObject(),
      id: order.toObject()._id,
      user: order.userId,
      userId: order.userId && order.userId._id ? order.userId._id : null,
    };
  });
};
const deleteOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully", deletedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
  getWeeklyReport,
};

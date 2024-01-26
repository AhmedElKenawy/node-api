// src/controllers/orderController.js

const Order = require("../models/Order");
const moment = require("moment");
const exceljs = require("exceljs");

const getWeeklyReport = async (req, res) => {
  try {
    const { weeklyReport, total } = await getWeeklyReportData(req);
    res.json({ usersReport: weeklyReport, report: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWeeklyReportData = async (req) => {
  const { startDate, endDate } = req.query;
  const startISODate = startDate ? new Date(moment(startDate).startOf("day")) : new Date();
  const endISODate = endDate
    ? new Date(moment(endDate).endOf("day"))
    : new Date(moment(new Date()).add(7, "days").endOf("day"));
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
        totalQuantity: { $sum: "$quantity" },
        sat: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 7] }, "$total", 0] } },
        sun: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 1] }, "$total", 0] } },
        mon: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 2] }, "$total", 0] } },
        tue: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 3] }, "$total", 0] } },
        wed: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 4] }, "$total", 0] } },
        thu: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 5] }, "$total", 0] } },
        fri: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: "$date" }, 6] }, "$total", 0] } },
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
        totalQuantity: "$totalQuantity",
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
        totalQuantity :  { $sum: "$quantity" }
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);

  const [total] = totalReport;
  return { total, weeklyReport };
};

const getAllOrders = async (req, res) => {
  const { page = 1, pageSize = 10 , filter } = req.query;
  try {
    let query = {};
    if(filter){
      query = JSON.parse(filter)
    }
    if (pageSize) {
      let orders;
      const skip = (page - 1) * pageSize;
      orders = await Order.find(query).populate(populateOrder).skip(skip).limit(Number(pageSize));
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
  const { userId, date, quantity, paid, price , category  , period} = req.body;
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
      period : period,
      category 
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
const getAveragePricePerQuantity = async (filter) => {
  try {
    const pipeline = [
      {
        $match: {
          $and :[
            {period : filter.period},
          ]
        },
      },
      {
        $group: {
          _id: null,
          averagePricePerQuantity: {
            $avg: {
              $divide: ["$price", "$quantity"],
            },
          },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    console.log(result);

    if (result.length === 0) {
    }

  } catch (error) {
    console.error(error);
  }
};
const populateOrder = {
  path: "userId",
  model: "User",
  options: { lean: true },
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

const exportWeeklyReport = async (req, res) => {
  try {
    const { weeklyReport, total } = await getWeeklyReportData(req);
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Weekly Report");

    // Add headers to the worksheet
    worksheet.addRow([
      "الاسم",
      "السعر الكلي",
      "المدفوع",
      "المتبقي",
      "الكمية",
      "السبت",
      "الاحد",
      "	الإثنين",
      "الثلاثاء",
      "الاربعاء",
      "الخميس",
      "الجمعة",
    ]);

    weeklyReport.forEach((user) => {
      worksheet.addRow([
        user.name,
        user.total,
        user.totalPaid,
        user.totalRemains,
        user.totalQuantity,
        user.sat,
        user.sun,
        user.mon,
        user.tue,
        user.wed,
        user.thu,
        user.fri,
      ]);
    });

    worksheet.addRow(["المجموع", total.total, total.totalPaid, total.totalRemains, total.totalQuantity,"","", "", "", "", "", "", ""]);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=weekly_report.xlsx");

    await workbook.xlsx.write(res);

   res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
  getWeeklyReport,
  exportWeeklyReport,
};

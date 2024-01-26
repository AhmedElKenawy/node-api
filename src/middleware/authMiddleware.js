const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "shabacy-apiR");
    if (decoded && decoded.userId) {
      const user = await Admin.findOne({ _id: decoded.userId });
      delete user.password;
      if (!user) {
        throw new Error();
      }
      req.token = token;
      req.user = user;
    } else {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = authMiddleware;

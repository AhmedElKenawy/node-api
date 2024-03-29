const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true  },
    role: { type: String , enum: ["ADMIN", "SUPER_ADMIN", "EMPLOYEE"], default: "EMPLOYEE" }
  },
  { collection: "admin" ,
  timestamps: true , toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  }
}
); // Set the collection name to 'admin'

// Hash the password before saving to the database
adminSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

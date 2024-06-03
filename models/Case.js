const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  propertyName: { type: String, required: true },
  city: { type: String, required: true },
  borrowerName: { type: String, required: true },
  createdAt: { type: String, required: true },
});

caseSchema.index({ bankName: 1, propertyName: 1 }, { unique: true }); // Compound index to enforce uniqueness

module.exports = mongoose.model("Case", caseSchema);

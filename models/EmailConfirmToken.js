const mongoose = require("mongoose")

const EmailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});
  
module.exports = VerifyUser = mongoose.model('EmailVerification', EmailVerificationSchema)
 



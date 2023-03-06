var mongoose = require("mongoose");
(jwt = require("jsonwebtoken")), (crypto = require("crypto"));
const IV_LENGTH = 16; // For AES, this is always 16

var Config = require("../config/config");
var ClientSchema = new mongoose.Schema(
  {
    id: { type: Number },
    title: { type: String },
    email: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    location: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    profilePhoto: { type: String, default: "" },
    uploadCertificate_file: { type: String, default: "" },
    password: { type: String },
    salary: { type: Number, default: 1 },
    summary: { type: String, default: "" },
    verifyStatus: {
      phoneVerify: { type: Boolean, default: false },
      emailVerify: { type: Boolean, default: false },
    },
    isVerified: { type: Boolean, default: false },
    active: { type: String, default: "Pending" },
    hide: { type: String, default: "Hide" },
    // nurses: [
    //   {
    //     nurseId: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    //     hidden: { type: Boolean, default: false },
    //   },
    // ],
    hiddenNurses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Nurse" }],
    createDate: { type: String },
    modifyDate: { type: String },
    reviewRating: { type: Number, default: 0.0 },
    reviews: { type: Number, default: 0 },
    currency: { type: String, default: "usd" },
    country: { type: String },
    routingNumber: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    accountHolderType: { type: String },
    paymentToken: { type: Object },
    customerSource: { type: Object },
    paymentVerify: { type: Boolean },
    city: { type: String },
    state: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    zipCode: { type: String },
    EINNumber: { type: String },
    role: { type: String },
  },
  { toJSON: { getters: true } }
);

ClientSchema.methods.setPassword = function (password) {
  let salt = Config.salt;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(salt), iv);
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  this.password = iv.toString("hex") + "g" + encrypted.toString("hex");
};

ClientSchema.methods.getPassword = function () {
  let salt = Config.salt;
  let textParts = this.password.split("g");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join("g"), "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(salt), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

ClientSchema.methods.validatePassword = function (password) {
  return this.getPassword() === password;
};

ClientSchema.methods.generateJwt = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: "admin",
      exp: 31556926, //1 year in seconds
    },
    "jwt-default-secret"
  );
};

module.exports = mongoose.model("Client", ClientSchema);

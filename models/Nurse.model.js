var mongoose = require("mongoose");
(jwt = require("jsonwebtoken")), (crypto = require("crypto"));
const IV_LENGTH = 16; // For AES, this is always 16

var Config = require("../config/config");

var NurseSchema = new mongoose.Schema(
  {
    id: { type: Number },
    email: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "NurseCategory" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
    hiddenNurses: [
      {
        nurse: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Nurse",
        },
        isHidden: {
          type: Boolean,
          default: false,
        },
      },
    ],
    title: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    location: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    profilePhoto: { type: String, default: "" },
    uploadCertificates: {
      type: [String],
      default: [],
    },
    uploadCertificate_file: { type: String, default: "" },
    password: { type: String },
    salary: { type: Number, default: 1 },
    summary: { type: String, default: "" },
    permission: { type: Number, default: 0 },
    latitude: { type: String },
    longitude: { type: String },
    zipCode: { type: String },
    verifyStatus: {
      phoneVerify: { type: Boolean, default: false },
      emailVerify: { type: Boolean, default: false },
    },
    isVerified: { type: Boolean, default: false },
    active: { type: String, default: "Pending" },
    createDate: { type: Date },
    dateOfBirth: { type: Date },
    modifyDate: { type: Date },
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

    role: { type: String },

    // geo location
    loc: {
      type: { type: String },
      coordinates: Array,
    },
  },
  { toJSON: { getters: true } }
);

NurseSchema.index({ loc: "2dsphere" });

NurseSchema.methods.setPassword = function (password) {
  let salt = Config.salt;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(salt), iv);
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  this.password = iv.toString("hex") + "g" + encrypted.toString("hex");
};

NurseSchema.methods.getPassword = function () {
  let salt = Config.salt;
  let textParts = this.password.split("g");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join("g"), "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(salt), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

NurseSchema.methods.validatePassword = function (password) {
  return this.getPassword() === password;
};

NurseSchema.methods.generateJwt = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: "admin",
      exp: 31556926, //1 year in seconds
    },
    "jwt-default-secret"
  );
};

module.exports = mongoose.model("Nurse", NurseSchema);

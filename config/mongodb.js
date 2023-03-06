var mongoose = require("mongoose");
const store = require("./../store");

const uri =
  "mongodb+srv://praecuroapp:December2020@cluster0.0w26w.mongodb.net/personal";

module.exports = () => {
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("useCreateIndex", true);
  return mongoose
    .connect(uri, { useNewUrlParser: true })
    .then(() => {
      store.connected = true;
      console.log("MongoDB successfully connected");
    })
    .catch((err) => console.log(err));
};

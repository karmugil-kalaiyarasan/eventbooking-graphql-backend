const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createEvents: [
    {
      type: Schema.Types.ObjectId, //the type of ids craeted by mongo db
      ref: "Event", // to make mongoose understand the realtion between two models so that we can fetch data by using the model name
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);

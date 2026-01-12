// js/User.cjs
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String },
    email: { type: String, unique: true, sparse: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Business" }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

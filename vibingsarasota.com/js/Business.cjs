const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true }
});

module.exports = mongoose.model("Business", BusinessSchema);

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./User.cjs");  // User model
const Business = require("./Business.cjs");  // Business model

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "mongo.env") });

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.join(__dirname, "..");

// -----------------------------
// Default route → signup first
// -----------------------------
app.get("/", (req, res) => {
    res.sendFile(path.join(ROOT_DIR, "signup.html"));
});

// -----------------------------
// Static files (everything else)
// -----------------------------
app.use(express.static(ROOT_DIR));


// ===========================
// Business Routes (unchanged)
// ===========================

// Get all businesses
app.get("/api/businesses", async (req, res) => {
    try {
        const businesses = await Business.find({});
        res.json(businesses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get businesses by category
app.get("/api/businesses/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const businesses = await Business.find({
            category: { $regex: `^${category}$`, $options: "i" }
        });
        res.json(businesses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search businesses
app.get("/api/search", async (req, res) => {
    const q = req.query.q || "";
    try {
        const businesses = await Business.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ]
        });
        res.json(businesses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add business
app.post("/api/businesses", async (req, res) => {
    try {
        const business = await Business.create(req.body);
        res.status(201).json(business);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Edit business
app.put("/api/businesses/:id", async (req, res) => {
    try {
        const updated = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete business
app.delete("/api/businesses/:id", async (req, res) => {
    try {
        const deleted = await Business.findByIdAndDelete(req.params.id);
        res.json({ message: "Business deleted", business: deleted });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// ===========================
// User Routes
// ===========================

// Signup (create user)
app.post("/api/signup", async (req, res) => {
    try {
        const { username, password, displayName, email } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ error: "Username already taken" });

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({ username, passwordHash, displayName, email });
        res.status(201).json({ message: "User created", user: { id: user._id, username: user.username } });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Login (verify credentials)
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "Invalid username or password" });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(400).json({ error: "Invalid username or password" });

        res.json({
            message: "Login successful",
            user: { id: user._id, username: user.username, displayName: user.displayName, email: user.email }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Test users (debugging)
app.get("/api/test-users", async (req, res) => {
    try {
        const users = await mongoose.connection.db.collection("users").find({}).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===========================
// Favorites Routes
// ===========================

// Add a business to user's favorites
app.post("/api/users/:userId/favorites/:businessId", async (req, res) => {
    try {
        const { userId, businessId } = req.params;

        // Ensure user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Check if business is already favorited
        if (!user.favorites.includes(businessId)) {
            user.favorites.push(businessId);
            await user.save();
        }

        res.json({ message: "Business added to favorites", favorites: user.favorites });
    } catch (err) {
        console.error("Add favorite error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Remove a business from user's favorites
app.delete("/api/users/:userId/favorites/:businessId", async (req, res) => {
    try {
        const { userId, businessId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.favorites = user.favorites.filter(fav => fav.toString() !== businessId);
        await user.save();

        res.json({ message: "Business removed from favorites", favorites: user.favorites });
    } catch (err) {
        console.error("Remove favorite error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all favorites for a user
app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate("favorites");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ favorites: user.favorites });
    } catch (err) {
        console.error("Get favorites error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/debug/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        res.json(user);
    } catch (err) {
        res.json({ error: "Could not load user" });
    }
});


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

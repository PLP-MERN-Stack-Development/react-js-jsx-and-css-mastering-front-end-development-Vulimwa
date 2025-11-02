const express = require("express");
const router = express.Router();
const user = require("../models/users");

router.get("/users", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { role } = req.query;
    const filter = role ? { role } : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      user
        .find(filter)
        .select("-password") // Exclude sensitive data
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }), // Add sorting
      user.countDocuments(filter), // Get total count for pagination
    ]);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasMore: skip + users.length < total,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});
//search endpoint
router.get("/users/search", async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }
    const users = await user.find({
      userName: { $regex: userName, $options: "i" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    // Validate if ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const foundUser = await user.findById(req.params.id).select("-password");
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(foundUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/users", async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is required" });
    }

    const { userName, email, role, status } = req.body;

    // Validate required fields
    if (!userName || !email) {
      return res
        .status(400)
        .json({ message: "Username and email are required" });
    }

    const newUser = new user({
      userName,
      email,
      role: role,
      status: status,
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    res.status(400).json({ message: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is required" });
    }

    const update = await user.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      select: "-password", 
    });

    if (!update) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: update,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const deleted = await user.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

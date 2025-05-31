const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { User, Token, SpinResult } = require("../models");
const {
  authenticateToken,
  requireSuperAdmin,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// ดูรายการแอดมินทั้งหมด (เฉพาะ SuperAdmin)
router.get("/users", authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "admin" })
      .populate("createdBy", "username")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// สร้างแอดมินใหม่ (เฉพาะ SuperAdmin)
router.post(
  "/users",
  authenticateToken,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

      const newUser = new User({
        username,
        password,
        role: "admin",
        createdBy: req.user._id,
      });

      await newUser.save();

      res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// ลบแอดมิน (เฉพาะ SuperAdmin)
router.delete(
  "/users/:id",
  authenticateToken,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role === "superadmin") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete SuperAdmin",
        });
      }

      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Admin deleted successfully",
      });
    } catch (error) {
      console.error("Delete admin error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// สร้าง Token ใหม่
router.post("/tokens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tokenId = uuidv4().replace(/-/g, "").substring(0, 12).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); // 2 วัน

    const newToken = new Token({
      tokenId,
      expiresAt,
      createdBy: req.user._id,
    });

    await newToken.save();

    res.status(201).json({
      success: true,
      message: "Token created successfully",
      data: {
        tokenId,
        expiresAt,
        createdAt: newToken.createdAt,
      },
    });
  } catch (error) {
    console.error("Create token error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ดูรายการ Token ทั้งหมด
router.get("/tokens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    const now = new Date();

    if (status === "used") {
      filter.isUsed = true;
    } else if (status === "unused") {
      filter.isUsed = false;
      filter.expiresAt = { $gt: now };
    } else if (status === "expired") {
      filter.isUsed = false;
      filter.expiresAt = { $lte: now };
    }

    const tokens = await Token.find(filter)
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Token.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tokens,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get tokens error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ดูผลการหมุนทั้งหมด
router.get(
  "/spin-results",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      const results = await SpinResult.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await SpinResult.countDocuments();

      res.json({
        success: true,
        data: {
          results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get spin results error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;

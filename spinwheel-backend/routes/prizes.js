const express = require("express");
const { Prize } = require("../models");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// ดูรางวัลทั้งหมด (Public - สำหรับหน้าลูกค้า)
router.get("/", async (req, res) => {
  try {
    let prizes = await Prize.find().sort({ position: 1 });

    // ถ้าไม่มีรางวัล ให้สร้างรางวัลเริ่มต้น
    if (prizes.length === 0) {
      const defaultPrizes = [
        {
          position: 1,
          name: "รางวัลที่ 1",
          description: "รางวัลใหญ่",
          probability: 5,
        },
        {
          position: 2,
          name: "รางวัลที่ 2",
          description: "รางวัลรอง",
          probability: 10,
        },
        {
          position: 3,
          name: "รางวัลที่ 3",
          description: "รางวัลปลอบใจ",
          probability: 15,
        },
        {
          position: 4,
          name: "รางวัลที่ 4",
          description: "รางวัลเล็ก",
          probability: 20,
        },
        {
          position: 5,
          name: "รางวัลที่ 5",
          description: "รางวัลน้อย",
          probability: 15,
        },
        {
          position: 6,
          name: "รางวัลที่ 6",
          description: "รางวัลเก็บตก",
          probability: 10,
        },
        {
          position: 7,
          name: "รางวัลที่ 7",
          description: "รางวัลใหม่",
          probability: 15,
        },
        {
          position: 8,
          name: "รางวัลที่ 8",
          description: "รางวัลพิเศษ",
          probability: 10,
        },
      ];

      // สร้างรางวัลเริ่มต้นโดยไม่ต้องมี updatedBy
      prizes = await Prize.insertMany(
        defaultPrizes.map((prize) => ({
          ...prize,
          updatedBy: null,
        }))
      );
    }

    res.json({
      success: true,
      data: prizes,
    });
  } catch (error) {
    console.error("Get prizes error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// อัพเดทรางวัล (เฉพาะ Admin)
router.put(
  "/bulk-update",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { prizes } = req.body;

      if (!Array.isArray(prizes) || prizes.length !== 8) {
        return res.status(400).json({
          success: false,
          message: "Must provide exactly 8 prizes",
        });
      }

      // ตรวจสอบว่าผลรวม probability = 100
      const totalProbability = prizes.reduce(
        (sum, prize) => sum + (prize.probability || 0),
        0
      );
      if (Math.abs(totalProbability - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          message: "Total probability must equal 100%",
        });
      }

      // ตรวจสอบ position ต้องเป็น 1-8
      for (let i = 0; i < prizes.length; i++) {
        const prize = prizes[i];
        if (!prize.position || prize.position < 1 || prize.position > 8) {
          return res.status(400).json({
            success: false,
            message: "Prize position must be between 1-8",
          });
        }
        if (!prize.name || prize.name.trim() === "") {
          return res.status(400).json({
            success: false,
            message: "Prize name is required",
          });
        }
      }

      // ลบรางวัลเก่าทั้งหมด
      await Prize.deleteMany({});

      // สร้างรางวัลใหม่
      const updatedPrizes = prizes.map((prize) => ({
        position: prize.position,
        name: prize.name.trim(),
        description: prize.description || "",
        probability: prize.probability,
        updatedBy: req.user._id,
        updatedAt: new Date(),
      }));

      const newPrizes = await Prize.insertMany(updatedPrizes);

      res.json({
        success: true,
        message: "Prizes updated successfully",
        data: newPrizes.sort((a, b) => a.position - b.position),
      });
    } catch (error) {
      console.error("Update prizes error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// อัพเดทรางวัลเดี่ยว (เฉพาะ Admin)
router.put("/:position", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { position } = req.params;
    const { name, description, probability } = req.body;

    if (position < 1 || position > 8) {
      return res.status(400).json({
        success: false,
        message: "Position must be between 1-8",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prize name is required",
      });
    }

    if (probability < 0 || probability > 100) {
      return res.status(400).json({
        success: false,
        message: "Probability must be between 0-100",
      });
    }

    const updatedPrize = await Prize.findOneAndUpdate(
      { position: parseInt(position) },
      {
        name: name.trim(),
        description: description || "",
        probability,
        updatedBy: req.user._id,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Prize updated successfully",
      data: updatedPrize,
    });
  } catch (error) {
    console.error("Update prize error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;

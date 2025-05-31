const express = require("express");
const { Token, Prize, SpinResult } = require("../models");

const router = express.Router();

// ตรวจสอบ Token
router.post("/verify-token", async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const token = await Token.findOne({ tokenId });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (token.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Token has already been used",
      });
    }

    if (token.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Token has expired",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      data: {
        tokenId: token.tokenId,
        expiresAt: token.expiresAt,
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// หมุนวงล้อ
router.post("/spin", async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // ตรวจสอบ Token
    const token = await Token.findOne({ tokenId });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (token.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Token has already been used",
      });
    }

    if (token.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Token has expired",
      });
    }

    // ดึงรางวัลทั้งหมด
    const prizes = await Prize.find().sort({ position: 1 });

    if (prizes.length !== 8) {
      return res.status(500).json({
        success: false,
        message: "Prize configuration error",
      });
    }

    // สุ่มรางวัลตาม probability
    const selectedPrize = selectPrizeByProbability(prizes);

    if (!selectedPrize) {
      return res.status(500).json({
        success: false,
        message: "Failed to select prize",
      });
    }

    // คำนวณมุมการหมุนให้หยุดที่รางวัลที่ถูกเลือก
    const segmentAngle = 360 / 8; // 45 องศาต่อช่อง
    const targetAngle = (selectedPrize.position - 1) * segmentAngle;

    // เพิ่มการหมุนหลายรอบเพื่อให้ดูสมจริง (3-6 รอบ)
    const extraRotations = Math.floor(Math.random() * 4) + 3; // 3-6 รอบ
    const finalAngle =
      extraRotations * 360 + targetAngle + Math.random() * 20 - 10; // เพิ่ม randomness เล็กน้อย

    // บันทึกผลการหมุน
    const spinResult = new SpinResult({
      tokenId,
      prizePosition: selectedPrize.position,
      prizeName: selectedPrize.name,
      spinAngle: finalAngle,
    });

    // อัพเดท Token เป็นใช้แล้ว
    token.isUsed = true;
    token.usedAt = new Date();

    // บันทึกลงฐานข้อมูล
    await Promise.all([spinResult.save(), token.save()]);

    res.json({
      success: true,
      message: "Spin completed successfully",
      data: {
        prize: {
          position: selectedPrize.position,
          name: selectedPrize.name,
          description: selectedPrize.description,
        },
        spinAngle: finalAngle,
        tokenUsed: true,
      },
    });
  } catch (error) {
    console.error("Spin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ฟังก์ชันสุ่มรางวัลตาม probability
function selectPrizeByProbability(prizes) {
  // สร้าง cumulative probability array
  let cumulative = 0;
  const cumulativePrizes = prizes.map((prize) => {
    cumulative += prize.probability;
    return {
      ...prize.toObject(),
      cumulativeProbability: cumulative,
    };
  });

  // สุ่มตัวเลข 0-100
  const random = Math.random() * 100;

  // หารางวัลที่ random number ตกอยู่ในช่วง
  for (const prize of cumulativePrizes) {
    if (random <= prize.cumulativeProbability) {
      return prize;
    }
  }

  // fallback เผื่อกรณีมีปัญหา
  return prizes[0];
}

module.exports = router;

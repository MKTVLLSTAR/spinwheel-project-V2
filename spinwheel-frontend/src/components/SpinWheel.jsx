import React, { useState, useRef } from "react";
import { Loader2, RotateCcw } from "lucide-react";

const SpinWheel = ({
  prizes = [],
  onSpin,
  isSpinning = false,
  disabled = false,
  size = 400,
}) => {
  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  // สีสำหรับแต่ละช่อง (สลับแดง-ทอง)
  const colors = [
    "#dc2626",
    "#fbbf24",
    "#b91c1c",
    "#f59e0b",
    "#991b1b",
    "#d97706",
    "#7f1d1d",
    "#b45309",
  ];

  // คำนวณมุมสำหรับแต่ละช่อง
  const segmentAngle = 360 / 8;

  // สร้าง path สำหรับแต่ละช่อง
  const createSegmentPath = (index) => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const radius = size / 2 - 10;
    const centerX = size / 2;
    const centerY = size / 2;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // คำนวณตำแหน่งข้อความ
  const getTextPosition = (index) => {
    const angle = ((index * segmentAngle + segmentAngle / 2) * Math.PI) / 180;
    const radius = size / 2 - 60;
    const centerX = size / 2;
    const centerY = size / 2;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // ฟังก์ชันหมุนวงล้อ
  const spinWheel = async (targetAngle) => {
    if (wheelRef.current) {
      const wheel = wheelRef.current;
      wheel.style.transition = "transform 4s cubic-bezier(0.23, 1, 0.32, 1)";
      wheel.style.transform = `rotate(${targetAngle}deg)`;
      setRotation(targetAngle);
    }
  };

  // Handle spin click
  const handleSpin = () => {
    if (onSpin && !isSpinning && !disabled) {
      onSpin(spinWheel);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* วงล้อ */}
      <div className="relative">
        {/* เงาของวงล้อ */}
        <div
          className="absolute top-2 left-2 rounded-full bg-black bg-opacity-20 blur-lg"
          style={{ width: size, height: size }}
        />

        {/* วงล้อหลัก */}
        <div
          className="relative bg-white rounded-full shadow-2xl border-8 border-yellow-400"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="absolute inset-0">
            {/* วาดช่องรางวัล */}
            {Array.from({ length: 8 }, (_, index) => {
              const prize = prizes[index] || { name: `รางวัลที่ ${index + 1}` };
              const textPos = getTextPosition(index);

              return (
                <g key={index}>
                  {/* ช่องรางวัล */}
                  <path
                    d={createSegmentPath(index)}
                    fill={colors[index]}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="prize-segment"
                  />

                  {/* ข้อความรางวัล */}
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    className="text-shadow select-none"
                  >
                    <tspan x={textPos.x} dy="-5">
                      {prize.name}
                    </tspan>
                    {prize.description && (
                      <tspan x={textPos.x} dy="15" fontSize="10">
                        {prize.description}
                      </tspan>
                    )}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* วงล้อที่หมุนได้ */}
          <div
            ref={wheelRef}
            className="absolute inset-0 rounded-full"
            style={{
              transformOrigin: "center",
              transform: `rotate(${rotation}deg)`,
            }}
          />

          {/* จุดตรงกลาง */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white shadow-lg z-10" />
        </div>

        {/* เข็มชี้ */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600 drop-shadow-lg" />
        </div>
      </div>

      {/* ปุ่มหมุน */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || disabled}
        className={`
          relative px-8 py-4 rounded-full font-bold text-xl shadow-xl transform transition-all duration-200
          ${
            isSpinning || disabled
              ? "bg-gray-400 cursor-not-allowed opacity-50"
              : "btn-gold hover:scale-105 active:scale-95 animate-pulse-gold"
          }
        `}
      >
        {isSpinning ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>กำลังหมุน...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-6 h-6" />
            <span>หมุนวงล้อ</span>
          </div>
        )}
      </button>

      {/* แสดงสถานะ */}
      {disabled && !isSpinning && (
        <p className="text-gray-500 text-center">
          กรุณาใส่ Token เพื่อเริ่มเล่น
        </p>
      )}
    </div>
  );
};

export default SpinWheel;

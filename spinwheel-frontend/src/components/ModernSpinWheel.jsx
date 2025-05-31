import React, { useState, useRef, useEffect } from "react";
import { Zap, Sparkles, Crown } from "lucide-react";

const ModernSpinWheel = ({
  prizes = [],
  onSpin,
  isSpinning = false,
  disabled = false,
  size = 400,
}) => {
  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Enhanced color palette - Modern gradients
  const colorPalette = [
    {
      primary: "#FF6B6B",
      secondary: "#FF8E53",
      glow: "rgba(255, 107, 107, 0.5)",
    },
    {
      primary: "#4ECDC4",
      secondary: "#44A08D",
      glow: "rgba(78, 205, 196, 0.5)",
    },
    {
      primary: "#45B7D1",
      secondary: "#96CEB4",
      glow: "rgba(69, 183, 209, 0.5)",
    },
    {
      primary: "#F093FB",
      secondary: "#F5576C",
      glow: "rgba(240, 147, 251, 0.5)",
    },
    {
      primary: "#4FACFE",
      secondary: "#00F2FE",
      glow: "rgba(79, 172, 254, 0.5)",
    },
    {
      primary: "#FFECD2",
      secondary: "#FCB69F",
      glow: "rgba(255, 236, 210, 0.5)",
    },
    {
      primary: "#A8EDEA",
      secondary: "#FED6E3",
      glow: "rgba(168, 237, 234, 0.5)",
    },
    {
      primary: "#D299C2",
      secondary: "#FEF9D7",
      glow: "rgba(210, 153, 194, 0.5)",
    },
  ];

  // Pulse effect when not spinning
  useEffect(() => {
    if (!isSpinning && !disabled) {
      const interval = setInterval(() => {
        setGlowIntensity((prev) => (prev === 0 ? 1 : 0));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSpinning, disabled]);

  const segmentAngle = 360 / 8;

  // Create modern segment path with rounded corners
  const createSegmentPath = (index) => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const outerRadius = size / 2 - 20;
    const innerRadius = 60;
    const centerX = size / 2;
    const centerY = size / 2;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1Outer = centerX + outerRadius * Math.cos(startAngleRad);
    const y1Outer = centerY + outerRadius * Math.sin(startAngleRad);
    const x2Outer = centerX + outerRadius * Math.cos(endAngleRad);
    const y2Outer = centerY + outerRadius * Math.sin(endAngleRad);

    const x1Inner = centerX + innerRadius * Math.cos(startAngleRad);
    const y1Inner = centerY + innerRadius * Math.sin(startAngleRad);
    const x2Inner = centerX + innerRadius * Math.cos(endAngleRad);
    const y2Inner = centerY + innerRadius * Math.sin(endAngleRad);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return `M ${x1Inner} ${y1Inner} 
            L ${x1Outer} ${y1Outer} 
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}
            L ${x2Inner} ${y2Inner}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner} Z`;
  };

  // Enhanced text positioning
  const getTextPosition = (index) => {
    const angle = ((index * segmentAngle + segmentAngle / 2) * Math.PI) / 180;
    const radius = size / 2 - 70;
    const centerX = size / 2;
    const centerY = size / 2;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      rotation: (index * segmentAngle + segmentAngle / 2 + 90) % 360,
    };
  };

  // Enhanced spin function
  const spinWheel = async (targetAngle) => {
    if (wheelRef.current) {
      const wheel = wheelRef.current;

      // Add multiple rotations for dramatic effect
      const extraRotations = Math.floor(Math.random() * 3) + 5; // 5-7 rotations
      const finalAngle = extraRotations * 360 + targetAngle;

      wheel.style.transition = "transform 4s cubic-bezier(0.23, 1, 0.32, 1)";
      wheel.style.transform = `rotate(${finalAngle}deg)`;
      setRotation(finalAngle);
    }
  };

  const handleSpin = () => {
    if (onSpin && !isSpinning && !disabled) {
      onSpin(spinWheel);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Modern Wheel Container */}
      <div className="relative">
        {/* Outer Glow Ring */}
        <div
          className="absolute -inset-6 rounded-full opacity-20 blur-xl transition-all duration-1000"
          style={{
            background: `conic-gradient(from 0deg, ${colorPalette
              .map((c) => c.glow)
              .join(", ")})`,
            transform: `scale(${1 + glowIntensity * 0.1})`,
          }}
        />

        {/* Main Wheel Container */}
        <div
          className="relative rounded-full shadow-2xl"
          style={{
            width: size,
            height: size,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          {/* Wheel SVG */}
          <svg
            width={size}
            height={size}
            className="absolute inset-0 overflow-hidden rounded-full"
          >
            <defs>
              {/* Gradient definitions for each segment */}
              {colorPalette.map((color, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: color.primary, stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: color.secondary, stopOpacity: 1 }}
                  />
                </linearGradient>
              ))}

              {/* Drop shadow filter */}
              <filter id="segment-shadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.3"
                />
              </filter>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Wheel segments */}
            {Array.from({ length: 8 }, (_, index) => {
              const prize = prizes[index] || { name: `รางวัลที่ ${index + 1}` };
              const textPos = getTextPosition(index);
              const color = colorPalette[index];

              return (
                <g key={index}>
                  {/* Segment background */}
                  <path
                    d={createSegmentPath(index)}
                    fill={`url(#gradient-${index})`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                    filter="url(#segment-shadow)"
                    className="transition-all duration-300 hover:brightness-110"
                  />

                  {/* Prize text with better typography */}
                  <g transform={`translate(${textPos.x}, ${textPos.y})`}>
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="13"
                      fontWeight="700"
                      filter="url(#glow)"
                      className="select-none font-sans"
                      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                    >
                      <tspan x="0" dy="-8">
                        {prize.name}
                      </tspan>
                      {prize.description && (
                        <tspan
                          x="0"
                          dy="16"
                          fontSize="9"
                          fontWeight="500"
                          opacity="0.9"
                        >
                          {prize.description}
                        </tspan>
                      )}
                    </text>

                    {/* Decorative icon for each segment */}
                    <g transform="translate(0, -25)">
                      {index % 3 === 0 && (
                        <Crown size={16} fill="white" opacity="0.7" />
                      )}
                      {index % 3 === 1 && (
                        <Sparkles size={16} fill="white" opacity="0.7" />
                      )}
                      {index % 3 === 2 && (
                        <Zap size={16} fill="white" opacity="0.7" />
                      )}
                    </g>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Rotating wheel layer */}
          <div
            ref={wheelRef}
            className="absolute inset-0 rounded-full"
            style={{
              transformOrigin: "center",
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)"
                : "none",
            }}
          />

          {/* Center hub with modern design */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.3), inset 0 2px 8px rgba(255,255,255,0.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Modern pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-20">
          <div
            className="w-0 h-0 filter drop-shadow-lg"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: "20px solid #f093fb",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            }}
          />
        </div>

        {/* Spinning particles effect */}
        {isSpinning && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  top: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                  left: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern Spin Button */}
      <div className="relative">
        <button
          onClick={handleSpin}
          disabled={isSpinning || disabled}
          className={`
            relative group px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl 
            transform transition-all duration-300 overflow-hidden
            ${
              isSpinning || disabled
                ? "opacity-50 cursor-not-allowed scale-95"
                : "hover:scale-105 active:scale-95 hover:shadow-3xl"
            }
          `}
          style={{
            background:
              isSpinning || disabled
                ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow:
              isSpinning || disabled
                ? "0 10px 25px rgba(0,0,0,0.2)"
                : "0 20px 40px rgba(102, 126, 234, 0.4)",
          }}
        >
          {/* Button glow effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          />

          {/* Button content */}
          <div className="relative flex items-center space-x-3 text-white">
            {isSpinning ? (
              <>
                <div className="relative">
                  <Sparkles className="w-6 h-6 animate-spin" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-6 h-6 opacity-30" />
                  </div>
                </div>
                <span>กำลังหมุน...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 group-hover:animate-pulse" />
                <span>หมุนวงล้อมหาสมบัติ</span>
                <Sparkles className="w-5 h-5 opacity-70" />
              </>
            )}
          </div>

          {/* Shimmer effect */}
          {!isSpinning && !disabled && (
            <div
              className="absolute inset-0 -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 opacity-20"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              }}
            />
          )}
        </button>

        {/* Status text */}
        {disabled && !isSpinning && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <p className="text-white/70 text-sm font-medium">
              ✨ ใส่ Token เพื่อปลดล็อคความมหัศจรรย์
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSpinWheel;

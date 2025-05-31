import React, { useState, useEffect } from "react";
import {
  Gift,
  Ticket,
  Clock,
  Trophy,
  Star,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Diamond,
  Target,
  Award,
} from "lucide-react";
import ModernSpinWheel from "../components/ModernSpinWheel";
import { prizeAPI, spinAPI, handleAPIError } from "../services/api";
import toast from "react-hot-toast";

const ModernCustomerPage = () => {
  const [token, setToken] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizes, setPrizes] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const response = await prizeAPI.getPrizes();
      setPrizes(response.data.data);
    } catch (error) {
      handleAPIError(error, "ไม่สามารถโหลดข้อมูลรางวัลได้");
    }
  };

  const verifyToken = async () => {
    if (!token.trim()) {
      toast.error("กรุณาใส่ Token");
      return;
    }

    setIsLoading(true);
    try {
      const response = await spinAPI.verifyToken(token.trim());
      setIsValidToken(true);
      toast.success("🎯 Token ถูกต้อง! พร้อมปลดล็อคความมหัศจรรย์");
    } catch (error) {
      setIsValidToken(false);
      handleAPIError(error, "Token ไม่ถูกต้องหรือหมดอายุแล้ว");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpin = async (spinWheelFunction) => {
    if (!isValidToken) {
      toast.error("กรุณาตรวจสอบ Token ก่อน");
      return;
    }

    setIsSpinning(true);
    try {
      const response = await spinAPI.spin(token.trim());
      const { prize, spinAngle } = response.data.data;

      await spinWheelFunction(spinAngle);

      setTimeout(() => {
        setResult(prize);
        setIsSpinning(false);
        toast.success(`🎉 ยินดีด้วย! คุณได้รับ ${prize.name}`, {
          duration: 5000,
          icon: "🏆",
        });
      }, 4000);
    } catch (error) {
      setIsSpinning(false);
      handleAPIError(error, "เกิดข้อผิดพลาดในการหมุนวงล้อ");
    }
  };

  const resetGame = () => {
    setToken("");
    setIsValidToken(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 bg-white rounded-full opacity-40"
                style={{
                  boxShadow: "0 0 6px rgba(255,255,255,0.8)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Modern Header */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="relative">
                <Crown className="w-10 h-10 text-yellow-300" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                    SPIN
                  </span>
                  <span className="text-white mx-2">&</span>
                  <span className="bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 bg-clip-text text-transparent">
                    WIN
                  </span>
                </h1>
                <p className="text-white/80 text-lg font-medium">
                  ✨ ปลดล็อคความมหัศจรรย์แห่งโชคลาภ ✨
                </p>
              </div>
              <div className="relative">
                <Trophy className="w-10 h-10 text-yellow-300" />
                <div className="absolute -top-1 -right-1">
                  <Star className="w-4 h-4 text-yellow-200 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Token Input Section */}
            {!result && (
              <div className="flex justify-center">
                <div
                  className="w-full max-w-2xl p-8 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                  }}
                >
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          }}
                        >
                          <Ticket className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Zap className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                      🎫 ใส่ Token มหัศจรรย์
                    </h2>
                    <p className="text-white/80 text-lg">
                      ใส่รหัสลับเพื่อปลดล็อควงล้อแห่งโชคลาภ
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                        placeholder="ใส่ Token 12 หลักที่นี่"
                        className="w-full px-6 py-4 text-center text-2xl font-mono font-bold rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300"
                        disabled={isValidToken}
                        maxLength={12}
                      />
                      {isValidToken && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={verifyToken}
                      disabled={isLoading || isValidToken}
                      className={`
                        w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform
                        ${
                          isValidToken
                            ? "bg-green-500 text-white cursor-not-allowed scale-95"
                            : "hover:scale-105 active:scale-95 shadow-xl"
                        }
                      `}
                      style={{
                        background: isValidToken
                          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: isValidToken
                          ? "0 10px 25px rgba(16, 185, 129, 0.3)"
                          : "0 15px 35px rgba(102, 126, 234, 0.4)",
                      }}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="relative">
                            <Target className="w-6 h-6 animate-spin" />
                            <div className="absolute inset-0 animate-ping opacity-30">
                              <Target className="w-6 h-6" />
                            </div>
                          </div>
                          <span>กำลังตรวจสอบ...</span>
                        </div>
                      ) : isValidToken ? (
                        <div className="flex items-center justify-center space-x-3">
                          <Shield className="w-6 h-6" />
                          <span>✅ ยืนยันสำเร็จ</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <Sparkles className="w-6 h-6" />
                          <span>ตรวจสอบ Token</span>
                        </div>
                      )}
                    </button>

                    {isValidToken && (
                      <div
                        className="p-4 rounded-2xl border border-green-400/30 animate-fade-in"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                        }}
                      >
                        <div className="flex items-center justify-center space-x-3 text-green-300">
                          <Award className="w-6 h-6" />
                          <span className="font-bold text-lg">
                            🎯 พร้อมหมุนวงล้อแล้ว!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SpinWheel Section */}
            <div className="flex justify-center">
              <div
                className="p-8 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    🎡 วงล้อแห่งโชคลาภ
                  </h2>
                  <p className="text-white/80 text-xl">
                    หมุนเพื่อปลดล็อครางวัลมหัศจรรย์!
                  </p>
                </div>

                <ModernSpinWheel
                  prizes={prizes}
                  onSpin={handleSpin}
                  isSpinning={isSpinning}
                  disabled={!isValidToken || !!result}
                  size={450}
                />
              </div>
            </div>

            {/* Result Section */}
            {result && (
              <div className="flex justify-center">
                <div
                  className="w-full max-w-2xl p-8 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl text-center animate-bounce-in"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%)",
                  }}
                >
                  <div className="mb-8">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
                          style={{
                            background:
                              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          }}
                        >
                          <Crown className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 animate-spin">
                          <Star className="w-8 h-8 text-yellow-300" />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-6">
                      🎉 ยินดีด้วย!
                    </h2>

                    <div
                      className="p-6 rounded-2xl mb-6"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {result.name}
                      </h3>
                      {result.description && (
                        <p className="text-white/90 text-lg">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-white/80 text-lg">
                      🎯 กรุณาติดต่อเจ้าหน้าที่เพื่อรับรางวัล
                    </p>

                    <button
                      onClick={resetGame}
                      className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        boxShadow: "0 15px 35px rgba(240, 147, 251, 0.4)",
                      }}
                    >
                      <div className="flex items-center justify-center space-x-3 text-white">
                        <Sparkles className="w-6 h-6" />
                        <span>เล่นใหม่อีกครั้ง</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modern Prize Showcase */}
            <div
              className="p-8 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              }}
            >
              <h3 className="text-3xl font-bold text-white mb-8 text-center">
                🏆 คลังรางวัลมหัศจรรย์
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prizes.map((prize, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-2xl border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-yellow-400/50"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold transition-all duration-300 group-hover:scale-110"
                        style={{
                          background:
                            index % 2 === 0
                              ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {prize.position}
                      </div>
                      <h4 className="font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                        {prize.name}
                      </h4>
                      {prize.description && (
                        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                          {prize.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Instructions */}
            <div
              className="p-8 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              }}
            >
              <h3 className="text-3xl font-bold text-white mb-8 text-center">
                📚 วิธีการใช้งาน
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Ticket,
                    title: "ใส่ Token",
                    description: "กรอกรหัส Token 12 หลักที่ได้รับ",
                    color: "from-blue-400 to-purple-500",
                  },
                  {
                    icon: Sparkles,
                    title: "หมุนวงล้อ",
                    description: "กดปุ่มหมุนเพื่อลุ้นโชค",
                    color: "from-purple-400 to-pink-500",
                  },
                  {
                    icon: Crown,
                    title: "รับรางวัล",
                    description: "ติดต่อเจ้าหน้าที่เพื่อรับรางวัล",
                    color: "from-pink-400 to-red-500",
                  },
                ].map((step, index) => (
                  <div key={index} className="text-center group">
                    <div className="mb-4">
                      <div
                        className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-r ${step.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-white/80">{step.description}</p>
                  </div>
                ))}
              </div>

              <div
                className="mt-8 p-6 rounded-2xl border border-yellow-400/30"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)",
                }}
              >
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-yellow-300 mb-2">
                      ⚠️ ข้อมูลสำคัญ
                    </h4>
                    <ul className="text-yellow-100 space-y-1 text-sm">
                      <li>• Token มีอายุใช้งาน 2 วันหลังจากสร้าง</li>
                      <li>• Token ใช้ได้เพียง 1 ครั้งเท่านั้น</li>
                      <li>• ผลการหมุนถูกกำหนดโดยระบบอัตโนมัติอย่างยุติธรรม</li>
                      <li>• รางวัลที่ได้ตรงกับระบบหลังบ้าน 100%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernCustomerPage;

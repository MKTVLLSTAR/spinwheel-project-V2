import React, { useState, useEffect } from "react";
import { Gift, Ticket, Clock, Trophy } from "lucide-react";
import SpinWheel from "../components/SpinWheel";
import { prizeAPI, spinAPI, handleAPIError } from "../services/api";
import toast from "react-hot-toast";

const CustomerPage = () => {
  const [token, setToken] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizes, setPrizes] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // โหลดรางวัลเมื่อ component mount
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

  // ตรวจสอบ Token
  const verifyToken = async () => {
    if (!token.trim()) {
      toast.error("กรุณาใส่ Token");
      return;
    }

    setIsLoading(true);
    try {
      const response = await spinAPI.verifyToken(token.trim());
      setIsValidToken(true);
      toast.success("Token ถูกต้อง! พร้อมหมุนวงล้อแล้ว");
    } catch (error) {
      setIsValidToken(false);
      handleAPIError(error, "Token ไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setIsLoading(false);
    }
  };

  // หมุนวงล้อ
  const handleSpin = async (spinWheelFunction) => {
    if (!isValidToken) {
      toast.error("กรุณาตรวจสอบ Token ก่อน");
      return;
    }

    setIsSpinning(true);
    try {
      const response = await spinAPI.spin(token.trim());
      const { prize, spinAngle } = response.data.data;

      // หมุนวงล้อไปยังมุมที่กำหนด
      await spinWheelFunction(spinAngle);

      // รอให้แอนิเมชันเสร็จ (4 วินาที)
      setTimeout(() => {
        setResult(prize);
        setIsSpinning(false);
        toast.success(`ยินดีด้วย! คุณได้รับ ${prize.name}`);
      }, 4000);
    } catch (error) {
      setIsSpinning(false);
      handleAPIError(error, "เกิดข้อผิดพลาดในการหมุนวงล้อ");
    }
  };

  // รีเซ็ตเพื่อเล่นใหม่
  const resetGame = () => {
    setToken("");
    setIsValidToken(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen gradient-bg-main flex flex-col">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <Gift className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white text-shadow-lg">
              🎰 SpinWheel Lucky Draw
            </h1>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Token Input Section */}
          {!result && (
            <div className="card-glass p-8 mb-8 animate-fade-in">
              <div className="text-center mb-6">
                <Ticket className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  ใส่ Token เพื่อเริ่มเล่น
                </h2>
                <p className="text-white text-opacity-80">
                  กรุณาใส่ Token ที่ได้รับจากแอดมินเพื่อหมุนวงล้อ
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="ใส่ Token ที่นี่"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center font-mono text-lg uppercase"
                  disabled={isValidToken}
                  maxLength={12}
                />
                <button
                  onClick={verifyToken}
                  disabled={isLoading || isValidToken}
                  className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                    isValidToken
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : "btn-gold hover:scale-105"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner" />
                      <span>ตรวจสอบ...</span>
                    </div>
                  ) : isValidToken ? (
                    "✓ ยืนยันแล้ว"
                  ) : (
                    "ตรวจสอบ Token"
                  )}
                </button>
              </div>

              {isValidToken && (
                <div className="mt-4 p-4 bg-green-600 bg-opacity-20 border border-green-400 rounded-lg animate-bounce-in">
                  <p className="text-green-200 text-center font-bold">
                    ✅ Token ถูกต้อง! พร้อมหมุนวงล้อแล้ว
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SpinWheel Section */}
          <div className="card-glass p-8 mb-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 text-shadow-lg">
                🎡 วงล้อนำโชค
              </h2>
              <p className="text-white text-opacity-80">
                หมุนวงล้อเพื่อลุ้นรับรางวัลมากมาย!
              </p>
            </div>

            <div className="flex justify-center">
              <SpinWheel
                prizes={prizes}
                onSpin={handleSpin}
                isSpinning={isSpinning}
                disabled={!isValidToken || !!result}
                size={400}
              />
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="card-glass p-8 text-center animate-bounce-in">
              <div className="mb-6">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4 text-shadow-lg">
                  🎉 ยินดีด้วย!
                </h2>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-xl shadow-xl">
                  <h3 className="text-2xl font-bold mb-2">{result.name}</h3>
                  {result.description && (
                    <p className="text-yellow-100">{result.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-white text-opacity-80">
                  กรุณาติดต่อเจ้าหน้าที่เพื่อรับรางวัล
                </p>
                <button onClick={resetGame} className="btn-red">
                  เล่นใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}

          {/* Prize List */}
          <div className="card-glass p-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-6 text-center text-shadow-lg">
              🏆 รางวัลทั้งหมด
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-10 p-4 rounded-lg border border-white border-opacity-20"
                >
                  <div className="text-center">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#dc2626" : "#fbbf24",
                      }}
                    >
                      {prize.position}
                    </div>
                    <h4 className="font-bold text-white mb-1">{prize.name}</h4>
                    {prize.description && (
                      <p className="text-sm text-white text-opacity-70">
                        {prize.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="card-glass p-6 mt-8 animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              📋 วิธีการใช้งาน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-white">ใส่ Token ที่ได้รับ</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-white">กดปุ่มหมุนวงล้อ</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-white">รับรางวัลที่ได้</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-400 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-200">
                <Clock className="w-5 h-5" />
                <span className="font-bold">หมายเหตุ:</span>
              </div>
              <ul className="text-yellow-100 text-sm mt-2 space-y-1 ml-7">
                <li>• Token มีอายุใช้งาน 2 วันหลังจากสร้าง</li>
                <li>• Token ใช้ได้เพียง 1 ครั้งเท่านั้น</li>
                <li>• ผลการหมุนถูกกำหนดโดยระบบอัตโนมัติ</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerPage;

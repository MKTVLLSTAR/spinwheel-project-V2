import React, { useState, useEffect } from "react";
import { Gift, Save, RotateCcw, Percent } from "lucide-react";
import { prizeAPI, handleAPIError, handleAPISuccess } from "../../services/api";
import toast from "react-hot-toast";

const PrizesPage = () => {
  const [prizes, setPrizes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalPrizes, setOriginalPrizes] = useState([]);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    setIsLoading(true);
    try {
      const response = await prizeAPI.getPrizes();
      const prizeData = response.data.data.sort(
        (a, b) => a.position - b.position
      );
      setPrizes(prizeData);
      setOriginalPrizes(JSON.parse(JSON.stringify(prizeData)));
    } catch (error) {
      handleAPIError(error, "ไม่สามารถโหลดข้อมูลรางวัลได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrizeChange = (position, field, value) => {
    setPrizes(
      prizes.map((prize) =>
        prize.position === position
          ? {
              ...prize,
              [field]: field === "probability" ? parseFloat(value) || 0 : value,
            }
          : prize
      )
    );
  };

  const calculateTotalProbability = () => {
    return prizes.reduce((total, prize) => total + (prize.probability || 0), 0);
  };

  const validatePrizes = () => {
    const totalProbability = calculateTotalProbability();

    if (Math.abs(totalProbability - 100) > 0.01) {
      toast.error(
        `ผลรวมของ % การออกรางวัลต้องเป็น 100% (ปัจจุบัน: ${totalProbability.toFixed(
          2
        )}%)`
      );
      return false;
    }

    for (const prize of prizes) {
      if (!prize.name || prize.name.trim() === "") {
        toast.error(`กรุณากรอกชื่อรางวัลช่องที่ ${prize.position}`);
        return false;
      }
      if (prize.probability < 0 || prize.probability > 100) {
        toast.error(`% การออกรางวัลต้องอยู่ระหว่าง 0-100`);
        return false;
      }
    }

    return true;
  };

  const savePrizes = async () => {
    if (!validatePrizes()) return;

    setIsSaving(true);
    try {
      await prizeAPI.updatePrizes(prizes);
      handleAPISuccess(null, "บันทึกการตั้งค่ารางวัลเรียบร้อยแล้ว");
      setOriginalPrizes(JSON.parse(JSON.stringify(prizes)));
    } catch (error) {
      handleAPIError(error, "ไม่สามารถบันทึกการตั้งค่ารางวัลได้");
    } finally {
      setIsSaving(false);
    }
  };

  const resetPrizes = () => {
    setPrizes(JSON.parse(JSON.stringify(originalPrizes)));
    toast.info("ยกเลิกการเปลี่ยนแปลง");
  };

  const hasChanges = () => {
    return JSON.stringify(prizes) !== JSON.stringify(originalPrizes);
  };

  const totalProbability = calculateTotalProbability();
  const isValidTotal = Math.abs(totalProbability - 100) <= 0.01;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูลรางวัล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Gift className="w-8 h-8 text-yellow-500" />
            <span>จัดการรางวัล</span>
          </h1>
          <p className="text-gray-600">กำหนดรางวัลและ % การออกของแต่ละช่อง</p>
        </div>

        <div className="flex space-x-3">
          {hasChanges() && (
            <button
              onClick={resetPrizes}
              className="btn bg-gray-500 hover:bg-gray-600 text-white flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ยกเลิก</span>
            </button>
          )}

          <button
            onClick={savePrizes}
            disabled={isSaving || !hasChanges() || !isValidTotal}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
              isSaving || !hasChanges() || !isValidTotal
                ? "bg-gray-400 cursor-not-allowed"
                : "btn-gold hover:scale-105"
            }`}
          >
            {isSaving ? (
              <>
                <div className="loading-spinner" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกการตั้งค่า</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Probability Summary */}
      <div
        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
          isValidTotal ? "border-green-500" : "border-red-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Percent
              className={`w-6 h-6 ${
                isValidTotal ? "text-green-500" : "text-red-500"
              }`}
            />
            <div>
              <h3 className="font-bold text-gray-900">ผลรวม % การออกรางวัล</h3>
              <p className="text-sm text-gray-600">ต้องเท่ากับ 100% พอดี</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`text-2xl font-bold ${
                isValidTotal ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalProbability.toFixed(2)}%
            </p>
            <p
              className={`text-sm ${
                isValidTotal ? "text-green-600" : "text-red-600"
              }`}
            >
              {isValidTotal
                ? "✓ ถูกต้อง"
                : `${
                    100 - totalProbability > 0 ? "ต้องเพิ่ม" : "ต้องลด"
                  } ${Math.abs(100 - totalProbability).toFixed(2)}%`}
            </p>
          </div>
        </div>
      </div>

      {/* Prizes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {prizes.map((prize) => (
          <div
            key={prize.position}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-yellow-400 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    backgroundColor:
                      prize.position % 2 === 1 ? "#dc2626" : "#fbbf24",
                  }}
                >
                  {prize.position}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  ช่องที่ {prize.position}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* Prize Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อรางวัล *
                </label>
                <input
                  type="text"
                  value={prize.name || ""}
                  onChange={(e) =>
                    handlePrizeChange(prize.position, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="ใส่ชื่อรางวัล"
                  maxLength={50}
                />
              </div>

              {/* Prize Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบายรางวัล
                </label>
                <textarea
                  value={prize.description || ""}
                  onChange={(e) =>
                    handlePrizeChange(
                      prize.position,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                  rows="2"
                  maxLength={200}
                />
              </div>

              {/* Probability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  % การออกรางวัล *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={prize.probability || ""}
                    onChange={(e) =>
                      handlePrizeChange(
                        prize.position,
                        "probability",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ยิ่งเปอร์เซ็นต์สูง รางวัลออกบ่อยกว่า
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          🔧 คำแนะนำการใช้งาน
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">การตั้งค่ารางวัล:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>ชื่อรางวัลจะแสดงบนวงล้อ</li>
              <li>คำอธิบายจะแสดงเมื่อได้รางวัล</li>
              <li>สามารถใส่รางวัลซ้ำได้</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">% การออกรางวัล:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>ผลรวมทั้งหมดต้องเป็น 100%</li>
              <li>เปอร์เซ็นต์สูง = โอกาสได้มาก</li>
              <li>สามารถใส่ทศนิยมได้</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ หมายเหตุ:</strong> การเปลี่ยนแปลงจะมีผลทันทีหลังจากบันทึก
            และจะส่งผลต่อการหมุนครั้งถัดไป
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrizesPage;

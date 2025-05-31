import React, { useState, useEffect } from "react";
import { BarChart3, Gift, TrendingUp, Calendar } from "lucide-react";
import { adminAPI, handleAPIError } from "../../services/api";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadResults();
  }, [pagination.page]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await adminAPI.getSpinResults(params);
      setResults(response.data.data.results);
      setPagination(response.data.data.pagination);

      // คำนวณสถิติ
      calculateStats(response.data.data.results);
    } catch (error) {
      handleAPIError(error, "ไม่สามารถโหลดข้อมูลผลการหมุนได้");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const prizeCount = {};
    let totalSpins = data.length;

    data.forEach((result) => {
      const key = `${result.prizePosition}-${result.prizeName}`;
      prizeCount[key] = (prizeCount[key] || 0) + 1;
    });

    // เรียงตามจำนวนที่ได้มากที่สุด
    const sortedPrizes = Object.entries(prizeCount)
      .map(([key, count]) => {
        const [position, name] = key.split("-");
        return {
          position: parseInt(position),
          name: name,
          count: count,
          percentage:
            totalSpins > 0 ? ((count / totalSpins) * 100).toFixed(1) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    setStats({
      totalSpins,
      prizeStats: sortedPrizes,
      mostPopularPrize: sortedPrizes[0] || null,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH");
  };

  const getPrizeColor = (position) => {
    return position % 2 === 1 ? "#dc2626" : "#fbbf24";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-purple-500" />
          <span>ผลการหมุนวงล้อ</span>
        </h1>
        <p className="text-gray-600">สถิติและรายงานการหมุนวงล้อทั้งหมด</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                การหมุนทั้งหมด
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSpins || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {stats.mostPopularPrize && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">
                  รางวัลยอดนิยม
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.mostPopularPrize.name}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.mostPopularPrize.count} ครั้ง (
                  {stats.mostPopularPrize.percentage}%)
                </p>
              </div>
              <Gift className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">วันนี้</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  results.filter(
                    (r) =>
                      new Date(r.createdAt).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </p>
              <p className="text-sm text-gray-500">การหมุน</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Prize Statistics */}
      {stats.prizeStats && stats.prizeStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            สถิติรางวัลที่ออก
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.prizeStats.map((prize) => (
              <div
                key={`${prize.position}-${prize.name}`}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: getPrizeColor(prize.position) }}
                  >
                    {prize.position}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {prize.name}
                    </h3>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">จำนวนครั้ง:</span>
                    <span className="font-semibold">{prize.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">เปอร์เซ็นต์:</span>
                    <span className="font-semibold">{prize.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${prize.percentage}%`,
                        backgroundColor: getPrizeColor(prize.position),
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            รายการผลการหมุนล่าสุด
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" />
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ยังไม่มีการหมุนวงล้อ</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รางวัลที่ได้
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ช่องที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      มุมการหมุน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่หมุน
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {result.tokenId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{
                              backgroundColor: getPrizeColor(
                                result.prizePosition
                              ),
                            }}
                          >
                            {result.prizePosition}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {result.prizeName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ช่อง {result.prizePosition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.spinAngle.toFixed(0)}°
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  หน้า {pagination.page} จาก {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;

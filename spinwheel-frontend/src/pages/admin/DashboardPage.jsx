import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Ticket,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { adminAPI, handleAPIError } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTokens: 0,
    usedTokens: 0,
    expiredTokens: 0,
    activeTokens: 0,
    totalSpins: 0,
    totalAdmins: 0,
  });
  const [recentTokens, setRecentTokens] = useState([]);
  const [recentSpins, setRecentSpins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tokensRes, spinsRes, usersRes] = await Promise.all([
        adminAPI.getTokens({ limit: 10 }),
        adminAPI.getSpinResults({ limit: 5 }),
        user.role === "superadmin"
          ? adminAPI.getUsers()
          : Promise.resolve({ data: { data: [] } }),
      ]);

      // คำนวณสถิติ Token
      const allTokensRes = await adminAPI.getTokens({ limit: 1000 });
      const allTokens = allTokensRes.data.data.tokens;
      const now = new Date();

      const usedCount = allTokens.filter((token) => token.isUsed).length;
      const expiredCount = allTokens.filter(
        (token) => !token.isUsed && new Date(token.expiresAt) <= now
      ).length;
      const activeCount = allTokens.filter(
        (token) => !token.isUsed && new Date(token.expiresAt) > now
      ).length;

      setStats({
        totalTokens: allTokens.length,
        usedTokens: usedCount,
        expiredTokens: expiredCount,
        activeTokens: activeCount,
        totalSpins: spinsRes.data.data.pagination.total,
        totalAdmins: usersRes.data.data?.length || 0,
      });

      setRecentTokens(tokensRes.data.data.tokens);
      setRecentSpins(spinsRes.data.data.results);
    } catch (error) {
      handleAPIError(error, "ไม่สามารถโหลดข้อมูล Dashboard ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewToken = async () => {
    try {
      await adminAPI.createToken();
      toast.success("สร้าง Token ใหม่เรียบร้อยแล้ว");
      loadDashboardData();
    } catch (error) {
      handleAPIError(error, "ไม่สามารถสร้าง Token ได้");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">ยินดีต้อนรับ, {user?.username}</p>
        </div>
        <button
          onClick={createNewToken}
          className="btn-gold flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>สร้าง Token ใหม่</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Token ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTokens}
              </p>
            </div>
            <Ticket className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Token ที่ใช้แล้ว
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.usedTokens}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Token หมดอายุ</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.expiredTokens}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">
                Token ใช้งานได้
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeTokens}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                การหมุนทั้งหมด
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSpins}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {user?.role === "superadmin" && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">
                  แอดมินทั้งหมด
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAdmins}
                </p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tokens */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Token ล่าสุด</h2>
            <Ticket className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {recentTokens.slice(0, 5).map((token) => (
              <div
                key={token._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-gray-900">
                    {token.tokenId}
                  </p>
                  <p className="text-xs text-gray-500">
                    สร้างโดย: {token.createdBy?.username}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      token.isUsed
                        ? "bg-green-100 text-green-800"
                        : new Date(token.expiresAt) <= new Date()
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {token.isUsed
                      ? "ใช้แล้ว"
                      : new Date(token.expiresAt) <= new Date()
                      ? "หมดอายุ"
                      : "ใช้งานได้"}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(token.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Spins */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">การหมุนล่าสุด</h2>
            <Gift className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {recentSpins.map((spin) => (
              <div
                key={spin._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-gray-900">
                    {spin.tokenId}
                  </p>
                  <p className="text-sm text-gray-700">{spin.prizeName}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-purple-600">
                      ช่อง {spin.prizePosition}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(spin.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          การดำเนินการด่วน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/tokens"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 text-center"
          >
            <Ticket className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">จัดการ Token</p>
          </a>

          <a
            href="/admin/prizes"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200 text-center"
          >
            <Gift className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">จัดการรางวัล</p>
          </a>

          <a
            href="/admin/results"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200 text-center"
          >
            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">ดูผลการหมุน</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

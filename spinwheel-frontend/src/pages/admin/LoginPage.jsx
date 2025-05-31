import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, User, Lock, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect ถ้า login แล้ว
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(formData);
      if (result.success) {
        // จะ redirect ไปที่ dashboard อัตโนมัติ
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-main flex items-center justify-center">
        <div className="text-center text-white">
          <div className="loading-spinner mx-auto mb-4" />
          <p>กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-glass p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-400 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              เข้าสู่ระบบแอดมิน
            </h1>
            <p className="text-white text-opacity-80">
              SpinWheel Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="กรอกชื่อผู้ใช้"
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="กรอกรหัสผ่าน"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "btn-gold hover:scale-105"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white text-opacity-60 text-sm">
              สำหรับแอดมินและ SuperAdmin เท่านั้น
            </p>
          </div>
        </div>

        {/* Back to Customer */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-white text-opacity-80 hover:text-white transition-colors duration-200"
          >
            ← กลับไปหน้าลูกค้า
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

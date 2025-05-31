import React, { useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Gift,
  Ticket,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Home,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const AdminLayout = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ถ้ายังไม่ได้ login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // แสดง loading ขณะตรวจสอบ
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

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/admin/dashboard",
    },
    {
      name: "จัดการรางวัล",
      href: "/admin/prizes",
      icon: Gift,
      current: location.pathname === "/admin/prizes",
    },
    {
      name: "จัดการ Token",
      href: "/admin/tokens",
      icon: Ticket,
      current: location.pathname === "/admin/tokens",
    },
    {
      name: "ผลการหมุน",
      href: "/admin/results",
      icon: BarChart3,
      current: location.pathname === "/admin/results",
    },
  ];

  // เพิ่มเมนู Users สำหรับ SuperAdmin
  if (user?.role === "superadmin") {
    navigation.push({
      name: "จัดการแอดมิน",
      href: "/admin/users",
      icon: Users,
      current: location.pathname === "/admin/users",
    });
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:inset-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-red-600">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">SpinWheel</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === "superadmin" ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    item.current
                      ? "bg-red-100 text-red-700 border-r-2 border-red-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon
                    className={`mr-3 w-5 h-5 ${
                      item.current
                        ? "text-red-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Other Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                <Home className="mr-3 w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                หน้าลูกค้า
              </a>

              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="mr-3 w-5 h-5 text-red-500" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-red-600" />
              <span className="text-lg font-bold text-gray-900">
                SpinWheel Admin
              </span>
            </div>
            <div className="w-6"></div> {/* Spacer */}
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

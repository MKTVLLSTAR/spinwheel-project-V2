import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, Shield, UserCheck } from "lucide-react";
import { adminAPI, handleAPIError, handleAPISuccess } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const UsersPage = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // ตรวจสอบว่าเป็น SuperAdmin หรือไม่
  if (user?.role !== "superadmin") {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ไม่มีสิทธิ์เข้าถึง
        </h2>
        <p className="text-gray-600">หน้านี้สำหรับ SuperAdmin เท่านั้น</p>
      </div>
    );
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getUsers();
      setAdmins(response.data.data);
    } catch (error) {
      handleAPIError(error, "ไม่สามารถโหลดข้อมูลแอดมินได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setIsCreating(true);
    try {
      await adminAPI.createUser(formData);
      handleAPISuccess(null, "สร้างแอดมินใหม่เรียบร้อยแล้ว");
      setFormData({ username: "", password: "" });
      setShowCreateModal(false);
      loadAdmins();
    } catch (error) {
      handleAPIError(error, "ไม่สามารถสร้างแอดมินได้");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async (adminId, username) => {
    if (!confirm(`คุณต้องการลบแอดมิน "${username}" หรือไม่?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(adminId);
      handleAPISuccess(null, "ลบแอดมินเรียบร้อยแล้ว");
      loadAdmins();
    } catch (error) {
      handleAPIError(error, "ไม่สามารถลบแอดมินได้");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-8 h-8 text-indigo-500" />
            <span>จัดการแอดมิน</span>
          </h1>
          <p className="text-gray-600">
            สร้างและจัดการบัญชีแอดมิน (เฉพาะ SuperAdmin)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gold flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มแอดมิน</span>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <UserCheck className="w-8 h-8 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">แอดมินทั้งหมด</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {admins.length} คน
            </p>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" />
              <p className="text-gray-600">กำลังโหลดข้อมูลแอดมิน...</p>
            </div>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ยังไม่มีแอดมิน</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สิทธิ์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สร้างโดย
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สร้าง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {admin.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.createdBy?.username || "ระบบ"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleDeleteAdmin(admin._id, admin.username)
                        }
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="ลบแอดมิน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateAdmin}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      เพิ่มแอดมินใหม่
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อผู้ใช้ *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="กรอกชื่อผู้ใช้"
                        disabled={isCreating}
                        autoComplete="username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสผ่าน *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                        disabled={isCreating}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-2">
                        <div className="loading-spinner" />
                        <span>กำลังสร้าง...</span>
                      </div>
                    ) : (
                      "สร้างแอดมิน"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ username: "", password: "" });
                    }}
                    disabled={isCreating}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-3">
          ⚠️ ข้อควรระวัง
        </h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>• การลบแอดมินจะทำให้ไม่สามารถเข้าสู่ระบบได้อีก</p>
          <p>• Token และรายการต่างๆ ที่แอดมินสร้างไว้จะยังคงอยู่ในระบบ</p>
          <p>• แนะนำให้ใช้รหัสผ่านที่แข็งแรงเพื่อความปลอดภัย</p>
          <p>• สามารถมีแอดมินได้หลายคน แต่ SuperAdmin มีได้เพียงคนเดียว</p>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

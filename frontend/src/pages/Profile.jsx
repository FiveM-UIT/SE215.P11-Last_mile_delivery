import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Shared/Header';
import { mockService } from '../services/mockService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiArrowLeft, FiSave, FiMail, FiPhone, FiUser, FiLock, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    username: '',
    avatar: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await mockService.getUserProfile();
      if (response.success) {
        const userData = response.data;
        setUserInfo({
          ...userData,
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || userData.username)}&background=0D8ABC&color=fff`
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Ảnh không được lớn hơn 5MB');
        return;
      }

      // Nén ảnh trước khi chuyển thành base64
      const compressedFile = await compressImage(file);
      const reader = new FileReader();

      reader.onloadend = () => {
        setUserInfo(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  // Hàm nén ảnh
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          }, 'image/jpeg', 0.7); // Nén với chất lượng 70%
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await mockService.updateProfile({
        fullName: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.phone,
        avatar: userInfo.avatar
      });

      if (response.success) {
        toast.success('Cập nhật thông tin thành công');
        // Cập nhật thông tin user trong localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Cập nhật thông tin thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50">
      <Header title="Thông Tin Cá Nhân" />

      {loading ? (
        <LoadingState />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Profile Header with Cover Image */}
              <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 
                overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Profile Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                  <div className="flex items-end space-x-6">
                    {/* Avatar Upload Section */}
                    <div className="relative group">
                      <div
                        onClick={handleImageClick}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-lg cursor-pointer
                          transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                      >
                        <img
                          src={userInfo.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100
                          transition-all duration-300 flex flex-col items-center justify-center space-y-1">
                          <FiCamera className="w-6 h-6 text-white" />
                          <span className="text-xs text-white">Thay đổi ảnh</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />

                      {/* Upload Progress Indicator */}
                      <motion.div
                        initial={false}
                        animate={{ scale: saving ? 1 : 0 }}
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2
                          bg-white rounded-full shadow-lg px-3 py-1"
                      >
                        <span className="text-xs text-blue-600 font-medium">Đang tải...</span>
                      </motion.div>
                    </div>

                    {/* User Info */}
                    <div>
                      <h2 className="text-3xl font-bold mb-1">{userInfo.fullName || userInfo.username}</h2>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                          {userInfo.role === 'Admin' ? '🌟 Quản trị viên'
                            : userInfo.role === 'DeliveryStaff' ? '💁‍♂️ Nhân viên giao hàng' : '🗣️  Người dùng'}
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                          ID: {userInfo.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUser className="w-5 h-5 mr-2 text-blue-500" />
                        Thông tin cơ bản
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên đăng nhập
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={userInfo.username}
                              disabled
                              className="w-full pl-10 pr-10 py-3 rounded-lg bg-white border border-gray-200 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              🔒
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={userInfo.fullName}
                              onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                              className="w-full pl-10 py-3 rounded-lg border border-gray-200 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              placeholder="Nhập họ và tên của bạn"
                            />
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vai trò hệ thống
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={userInfo.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
                              disabled
                              className="w-full pl-10 pr-10 py-3 rounded-lg bg-white border border-gray-200 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                            <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {userInfo.role === 'Admin' ? '🌟' : userInfo.role === 'DeliveryStaff' ? '💁‍♂️' : '🗣️'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Section */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiPhone className="w-5 h-5 mr-2 text-blue-500" />
                        Thông tin liên hệ
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={userInfo.email}
                              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                              className="w-full pl-10 py-3 rounded-lg border border-gray-200 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              placeholder="example@email.com"
                            />
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={userInfo.phone}
                              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                              className="w-full pl-10 py-3 rounded-lg border border-gray-200 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              placeholder="Nhập số điện thoại của bạn"
                            />
                            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Last Updated Info */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-blue-600">
                        Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700
                  hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white
                  rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2
                  transform hover:scale-105 hover:shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu thay đổi...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

// Loading State Component
const LoadingState = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="h-48 bg-gray-200" />

        {/* Avatar Skeleton */}
        <div className="relative px-8">
          <div className="absolute -top-16 flex items-end space-x-4">
            <div className="w-32 h-32 rounded-xl bg-gray-300" />
            <div className="pb-4 space-y-2">
              <div className="h-8 w-48 bg-gray-300 rounded" />
              <div className="h-4 w-24 bg-gray-300 rounded" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="pt-20 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Profile; 
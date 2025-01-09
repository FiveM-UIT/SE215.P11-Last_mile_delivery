import React, { useState } from 'react';
import Header from '../components/Shared/Header';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showProfile: true,
      showLocation: false
    },
    theme: 'light'
  });

  const handleNotificationChange = (type) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyChange = (type) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Cài Đặt" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Cài đặt thông báo
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý cách bạn nhận thông báo
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
              </div>
              <button
                className={`${
                  settings.notifications.email
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handleNotificationChange('email')}
              >
                <span
                  className={`${
                    settings.notifications.email ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Push</label>
                <p className="text-sm text-gray-500">Nhận thông báo trực tiếp</p>
              </div>
              <button
                className={`${
                  settings.notifications.push
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handleNotificationChange('push')}
              >
                <span
                  className={`${
                    settings.notifications.push ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Cài đặt quyền riêng tư
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý thông tin hiển thị của bạn
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Hiển thị hồ sơ</label>
                <p className="text-sm text-gray-500">Cho phép người khác xem hồ sơ của bạn</p>
              </div>
              <button
                className={`${
                  settings.privacy.showProfile
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handlePrivacyChange('showProfile')}
              >
                <span
                  className={`${
                    settings.privacy.showProfile ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Hiển thị vị trí</label>
                <p className="text-sm text-gray-500">Cho phép theo dõi vị trí của bạn</p>
              </div>
              <button
                className={`${
                  settings.privacy.showLocation
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handlePrivacyChange('showLocation')}
              >
                <span
                  className={`${
                    settings.privacy.showLocation ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
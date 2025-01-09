import React from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Chính sách bảo mật</h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Quay lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Last updated date */}
            <div className="text-sm text-gray-500">
              Cập nhật lần cuối: 15/03/2024
            </div>

            {/* Introduction */}
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                Đây là một đồ án môn học về hệ thống quản lý giao hàng chặng cuối. Mọi thông tin và dữ liệu trong hệ thống này chỉ được sử dụng cho mục đích học tập và nghiên cứu.
              </p>
            </div>

            {/* Main Sections */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 mr-3">1</span>
                  Mục đích và phạm vi
                </h2>
                <div className="pl-11">
                  <p className="text-gray-600 leading-relaxed">
                    Hệ thống này được phát triển như một phần của đồ án môn học, nhằm mục đích:
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-2">
                    <li>Nghiên cứu và học tập về hệ thống quản lý giao hàng</li>
                    <li>Thực hành phát triển ứng dụng web</li>
                    <li>Tìm hiểu về quy trình giao hàng chặng cuối</li>
                    <li>Áp dụng kiến thức đã học vào thực tế</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 mr-3">2</span>
                  Dữ liệu và bảo mật
                </h2>
                <div className="pl-11">
                  <p className="text-gray-600 leading-relaxed">
                    Về việc xử lý dữ liệu trong hệ thống:
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-2">
                    <li>Dữ liệu được sử dụng chỉ mang tính chất minh họa</li>
                    <li>Không lưu trữ thông tin nhạy cảm của người dùng</li>
                    <li>Mọi thông tin đều được mã hóa cơ bản</li>
                    <li>Dữ liệu có thể được xóa sau khi kết thúc môn học</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 mr-3">3</span>
                  Quyền sở hữu trí tuệ
                </h2>
                <div className="pl-11">
                  <p className="text-gray-600 leading-relaxed">
                    Đây là đồ án được phát triển cho mục đích học tập tại trường Đại học. Mọi quyền sở hữu trí tuệ thuộc về nhóm phát triển và giảng viên hướng dẫn.
                  </p>
                </div>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              <p className="text-gray-600">
                Mọi thắc mắc về đồ án, vui lòng liên hệ:
              </p>
              <div className="mt-4 text-gray-600">
                <p>Giảng viên hướng dẫn: Nguyễn Công Hoan</p>
                <p>Sinh viên thực hiện 1: Trần Nhật Tân - 22521312</p>
                <p>Sinh viên thực hiện 2: Nguyễn Duy Vũ - 22521693</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 
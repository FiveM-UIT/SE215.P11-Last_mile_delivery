import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Điều khoản sử dụng</h1>
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
                Đây là điều khoản sử dụng của hệ thống quản lý giao hàng chặng cuối, được phát triển như một phần của đồ án môn học. Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng hệ thống.
              </p>
            </div>

            {/* Main Sections */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 mr-3">1</span>
                  Mục đích sử dụng
                </h2>
                <div className="pl-11">
                  <p className="text-gray-600 leading-relaxed">
                    Hệ thống này được phát triển và sử dụng cho mục đích:
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-2">
                    <li>Mô phỏng quy trình giao hàng chặng cuối</li>
                    <li>Thử nghiệm và đánh giá hiệu quả của hệ thống</li>
                    <li>Phục vụ cho việc học tập và nghiên cứu</li>
                    <li>Minh họa các tính năng quản lý giao hàng</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 mr-3">2</span>
                  Quy định sử dụng
                </h2>
                <div className="pl-11">
                  <p className="text-gray-600 leading-relaxed">
                    Khi sử dụng hệ thống, người dùng cần:
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-2">
                    <li>Tuân thủ quy định và hướng dẫn sử dụng</li>
                    <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                    <li>Không sử dụng dữ liệu cho mục đích thương mại</li>
                    <li>Báo cáo các lỗi phát sinh (nếu có) cho nhóm phát triển</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 mr-3">3</span>
                  Giới hạn trách nhiệm
                </h2>
                <div className="pl-11">
                  <p className="text-gray-600 leading-relaxed">
                    Đây là dự án học tập, do đó:
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-2">
                    <li>Hệ thống có thể chưa hoàn thiện hoặc còn lỗi</li>
                    <li>Không đảm bảo tính liên tục của dịch vụ</li>
                    <li>Dữ liệu có thể bị xóa sau khi kết thúc môn học</li>
                    <li>Không chịu trách nhiệm về các thiệt hại phát sinh</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center text-xl font-semibold text-gray-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 mr-3">4</span>
                  Quyền sở hữu trí tuệ
                </h2>
                <div className="pl-11">
                  <p className="text-gray-600 leading-relaxed">
                    Tất cả quyền sở hữu trí tuệ liên quan đến hệ thống này thuộc về:
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-2">
                    <li>Nhóm sinh viên phát triển dự án</li>
                    <li>Giảng viên hướng dẫn</li>
                    <li>Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              <p className="text-gray-600">
                Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ:
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

export default Terms; 
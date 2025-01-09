import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Company and Contact */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-primary-600">Last Mile Delivery</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">Hotline: 1800-123-456</span>
            </div>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-6">
            <a href="/terms" 
               className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Terms
            </a>
            <span className="text-gray-300">|</span>
            <a href="/privacy" 
               className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Privacy
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Last Mile Delivery.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

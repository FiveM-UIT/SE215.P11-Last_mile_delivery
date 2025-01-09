import React, { useState } from 'react';
import { FiX, FiStar, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const RatingDialog = ({ isOpen, onClose, onSubmit, deliveryStaff }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [attitude, setAttitude] = useState('good');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit({
        rating,
        comment,
        attitude,
        staffId: deliveryStaff._id
      });
      // Reset form
      setRating(0);
      setComment('');
      setAttitude('good');
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Rate Delivery Staff
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Driver Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <img
              src={"https://res.cloudinary.com/dntdeq1gh/image/upload/v1735899336/avatars/seo1nqel37lvlamrlhwb.jpg"}
              alt={deliveryStaff.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium text-gray-900">{deliveryStaff.fullName}</h4>
              <p className="text-sm text-gray-500">{deliveryStaff.phone}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Star Rating
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-2xl focus:outline-none"
                >
                  <FiStar
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Attitude Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Attitude
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'good', label: 'Good', color: 'bg-green-100 text-green-800' },
                { value: 'normal', label: 'Normal', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'bad', label: 'Poor', color: 'bg-red-100 text-red-800' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAttitude(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${attitude === option.value 
                      ? option.color
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter your comments..."
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!rating || submitting}
            className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2
              ${rating && !submitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FiSend className="w-5 h-5" />
                <span>Submit Rating</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingDialog; 
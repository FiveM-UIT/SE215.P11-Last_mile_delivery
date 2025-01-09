import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const updateNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.length);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      updateNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext); 
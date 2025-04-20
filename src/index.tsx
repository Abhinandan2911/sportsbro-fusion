import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// CRITICAL FIX - Before app loads, make sure any existing user never triggers the profile popup
(function cleanupUserData() {
  try {
    console.log("Running initial cleanup of localStorage user data");
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // If a user exists in localStorage, ensure their isFirstLogin is false
      const userData = JSON.parse(storedUser);
      
      // Force these flags to ensure no popup
      userData.isFirstLogin = false;
      localStorage.setItem('profileCompletionDismissed', 'true');
      
      // Save back to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      console.log("User data cleaned up - isFirstLogin set to false");
    }
    
    // Also ensure the dialog is dismissed for the current session
    localStorage.setItem('profileCompletionDismissed', 'true');
  } catch (err) {
    console.error("Error cleaning up user data:", err);
  }
})();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
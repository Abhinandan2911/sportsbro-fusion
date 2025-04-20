/**
 * Emergency script to reset profile popup state
 * 
 * To use this:
 * 1. Open your browser's console (F12)
 * 2. Run: fetch('/reset-profile-popup.js').then(r => r.text()).then(eval)
 * 3. The popup should now be permanently disabled for this user
 */

(function resetProfilePopup() {
  try {
    console.log("🚨 EMERGENCY RESET - Running profile popup reset");
    
    // First clear the user data entirely
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // Force the user to not be a first time user
      parsedUser.isFirstLogin = false;
      
      // Save back to localStorage
      localStorage.setItem('user', JSON.stringify(parsedUser));
      console.log("✅ User data updated: isFirstLogin = false");
    }
    
    // Set all relevant flags to prevent popup
    localStorage.setItem('profileCompletionDismissed', 'true');
    
    // Add emergency window method for additional resets
    window.resetProfilePopup = function() {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.isFirstLogin = false;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
      localStorage.setItem('profileCompletionDismissed', 'true');
      console.log("✅ Profile popup has been reset");
      return "Profile popup reset successful";
    };
    
    console.log("🔧 Emergency window.resetProfilePopup() function added");
    console.log("✅ Profile popup reset complete! Please refresh the page.");
    
    return "Profile popup reset successful. Please refresh the page.";
  } catch (err) {
    console.error("❌ Error resetting profile popup:", err);
    return `Error: ${err.message}`;
  }
})(); 
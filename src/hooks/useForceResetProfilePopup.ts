import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * A hook that can be used to force the profile completion popup to not show
 * Use this in any component where you're seeing the popup when it shouldn't show
 */
export const useForceResetProfilePopup = () => {
  const { user, dismissProfileCompletion } = useAuth();
  
  useEffect(() => {
    // Only run this if there's a user
    if (user) {
      console.log('Force reset profile popup called');
      
      // Dismiss the popup via the context
      dismissProfileCompletion();
      
      // Set localStorage flags
      localStorage.setItem('profileCompletionDismissed', 'true');
      
      // Update isFirstLogin flag if necessary
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.isFirstLogin) {
            parsedUser.isFirstLogin = false;
            localStorage.setItem('user', JSON.stringify(parsedUser));
            console.log('Reset isFirstLogin flag for user');
          }
        } catch (err) {
          console.error('Error resetting user data:', err);
        }
      }
      
      // Set session flags to prevent showing again in this session
      sessionStorage.setItem(`dialog_shown_${user.userId}`, 'true');
      
      // Update seen users list
      const seenUsersBefore = sessionStorage.getItem('seen_users') || '[]';
      try {
        const seenUsers = JSON.parse(seenUsersBefore) as string[];
        if (!seenUsers.includes(user.userId)) {
          seenUsers.push(user.userId);
          sessionStorage.setItem('seen_users', JSON.stringify(seenUsers));
        }
      } catch (err) {
        console.error('Error updating seen users:', err);
      }
    }
  }, [user, dismissProfileCompletion]);
};

export default useForceResetProfilePopup; 
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Camera, Activity } from 'lucide-react';

const ProfileCompletionDialog = () => {
  const { shouldShowProfileCompletion, dismissProfileCompletion, user } = useAuth();
  const navigate = useNavigate();

  // FORCE DISMISS - If this component renders more than once in a session for the same user, 
  // it's likely a bug, so we should suppress it
  useEffect(() => {
    // Check if we've already shown this dialog for this user in this session
    const dialogState = sessionStorage.getItem(`dialog_shown_${user?.userId}`);
    if (dialogState) {
      console.log(`Dialog has already been shown for user ${user?.userId} in this session, preventing duplicate`);
      dismissProfileCompletion();
      return;
    }
    
    // Mark that we've shown the dialog for this user
    if (user?.userId) {
      sessionStorage.setItem(`dialog_shown_${user.userId}`, 'true');
    }
  }, [user?.userId, dismissProfileCompletion]);
  
  // Additional safety check - ensure we're only showing for new users
  useEffect(() => {
    // EXTRA CHECK: If user is loaded from localStorage, they are NOT new
    if (localStorage.getItem('user')) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // If user IDs match, this is definitely a returning user
      if (storedUser.userId === user?.userId) {
        console.log('User found in localStorage with matching ID - this is a returning user');
        dismissProfileCompletion();
        return;
      }
    }
    
    // If this is not a first login or the user profile is complete, don't show dialog
    if (!user?.isFirstLogin || user?.isProfileComplete) {
      console.log('Safety check in ProfileCompletionDialog - dismissing dialog', {
        isFirstLogin: user?.isFirstLogin,
        isProfileComplete: user?.isProfileComplete
      });
      dismissProfileCompletion();
    }
  }, [user, dismissProfileCompletion]);

  const handleEditProfile = () => {
    dismissProfileCompletion();
    navigate('/profile');
  };

  const handleDismiss = () => {
    dismissProfileCompletion();
  };

  // Only show for users that are definitely on their first login and have incomplete profiles
  const shouldShow = shouldShowProfileCompletion && user?.isFirstLogin === true && user?.isProfileComplete === false;
  
  console.log('ProfileCompletionDialog render decision:', {
    contextValue: shouldShowProfileCompletion,
    isFirstLogin: user?.isFirstLogin,
    isProfileComplete: user?.isProfileComplete,
    finalDecision: shouldShow
  });

  return (
    <Dialog open={shouldShow} onOpenChange={open => {
      if (!open) dismissProfileCompletion();
    }}>
      <DialogContent className="max-w-md bg-gradient-to-br from-zinc-900 to-zinc-950 border-amber-500/50 text-white shadow-lg shadow-amber-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl text-amber-400 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Complete Your Athlete Profile
          </DialogTitle>
          <DialogDescription className="text-zinc-300">
            Let's showcase your sports talents! Complete your profile to connect with other athletes and teams.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 bg-zinc-800/50 p-3 rounded-lg">
            <Activity className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Add Your Sports</h4>
              <p className="text-sm text-zinc-400">Tell us which sports you play or are interested in</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-zinc-800/50 p-3 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Showcase Achievements</h4>
              <p className="text-sm text-zinc-400">Add your awards, tournaments, and records</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-zinc-800/50 p-3 rounded-lg">
            <Camera className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Upload Profile Photo</h4>
              <p className="text-sm text-zinc-400">Add a photo to make your profile stand out</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Remind Me Later
          </Button>
          <Button
            onClick={handleEditProfile}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
          >
            Complete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionDialog; 
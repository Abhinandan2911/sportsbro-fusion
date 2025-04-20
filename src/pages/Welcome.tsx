import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Welcome = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#242424] rounded-xl p-8 shadow-2xl border border-amber-500/20">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to SportsBro!</h2>
          
          {user && (
            <p className="text-amber-500 font-medium text-xl mb-6">
              {user.fullName || 'New User'}
            </p>
          )}
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 mb-6 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="white" 
              className="w-14 h-14"
            >
              <path d="M4 19h2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2h2v-9H4v9Zm8-14c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5Z" />
            </svg>
          </div>
          
          <p className="text-gray-300 text-center mb-8">
            You've successfully signed up! We're excited to have you join our community of sports enthusiasts.
            Let's get your profile set up so you can start connecting with teams and players.
          </p>
          
          <div className="space-y-4 w-full">
            <Link to="/profile" className="block w-full">
              <Button variant="default" className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                Complete Your Profile
              </Button>
            </Link>
            
            <Link to="/" className="block w-full">
              <Button variant="outline" className="w-full border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                Explore First
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 
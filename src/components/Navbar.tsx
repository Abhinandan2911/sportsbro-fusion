import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Home, Dumbbell, Users, ShoppingBag, Crown, Menu, X, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import PremiumDialog from './PremiumDialog';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2); // Example count - in a real app this would come from an API
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node) && 
        showNotifications
      ) {
        setShowNotifications(false);
      }

      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node) && 
        showProfileDropdown
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileDropdown]);

  const isActive = (path: string) => location.pathname === path;

  const handlePremiumClick = () => {
    setIsPremiumDialogOpen(true);
  };

  const handleLoginClick = () => {
    if (location.pathname === '/') {
      const loginSection = document.querySelector('.login-section');
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollToLogin: true } });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Add these notifications for demonstration purposes
  const sampleNotifications = [
    {
      id: 1,
      type: 'teamJoinRequest',
      message: 'John Smith requested to join your Basketball team',
      time: '10 min ago'
    },
    {
      id: 2,
      type: 'teamInvite',
      message: 'You were invited to join Soccer Stars team',
      time: '2 hours ago'
    }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileOptionClick = (path: string) => {
    console.log('Navigation requested to profile option:', path);
    setShowProfileDropdown(false);
    
    // Add some debug output to help diagnose auth issues
    if (path === '/profile') {
      console.log('Current auth state before profile navigation:');
      console.log('- isLoggedIn:', isLoggedIn);
      console.log('- user:', user);
      console.log('- authToken exists:', !!localStorage.getItem('authToken'));
      
      // Always ensure the isLoggedIn flag is set before navigation 
      localStorage.setItem('isLoggedIn', 'true');
      
      // Use navigate with replace to avoid adding history entries
      navigate(path, { replace: true });
    } else {
      // For other paths, use normal navigation
      navigate(path);
    }
  };

  // Function to render user avatar (profile photo or fallback)
  const renderUserAvatar = (size: 'sm' | 'md' | 'lg' = 'md') => {
    // Size classes
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
    
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    if (user?.profilePhoto) {
      // Return profile photo if available
      return (
        <img 
          src={user.profilePhoto} 
          alt={user.fullName}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-amber-500/30`}
        />
      );
    } else if (user?.fullName) {
      // Return initials avatar if no photo but name is available
      const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
      );
    } else {
      // Default to user icon if no photo or name
      return <User className={`${iconSizeClasses[size]} text-white`} />;
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out backdrop-blur-md',
          isScrolled 
            ? 'py-3 bg-black/10 border-b border-white/10' 
            : 'py-5 bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 focus-ring rounded-md">
            <Activity className="h-8 w-8 text-white" />
            <span className="text-xl font-display font-bold text-white">SportsBro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors",
                isActive("/") ? "text-white" : "text-white/70 hover:text-white"
              )}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/training"
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors",
                isActive("/training") ? "text-white" : "text-white/70 hover:text-white"
              )}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Training</span>
            </Link>
            <Link
              to="/teams"
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors",
                isActive("/teams") ? "text-white" : "text-white/70 hover:text-white"
              )}
            >
              <Users className="w-4 h-4" />
              <span>Teams</span>
            </Link>
            <Link
              to="/gear-hub"
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]",
                isActive("/gear-hub") ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" : "text-white/70 hover:text-white"
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Gear Hub</span>
            </Link>
            
            {/* Add Notification Bell - only show if logged in */}
            {isLoggedIn && (
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={handleNotificationClick}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  <Bell className="w-5 h-5 text-white" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#2a2a2a] border border-white/10 shadow-lg rounded-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                      <h3 className="font-medium text-white">Notifications</h3>
                      <button className="text-xs text-white/70 hover:text-white">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {sampleNotifications.length > 0 ? (
                        sampleNotifications.map(notification => (
                          <div key={notification.id} className="px-4 py-3 border-b border-white/10 hover:bg-white/5">
                            <p className="text-sm text-white">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-400">
                          <p>No new notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-white/10">
                      <Link 
                        to="/notifications" 
                        className="text-xs text-white/70 hover:text-white"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handlePremiumClick}
              className="flex items-center space-x-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
            >
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </button>
            {isLoggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] overflow-hidden"
                >
                  {renderUserAvatar('md')}
                </button>
                
                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-white/10 shadow-lg rounded-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="font-medium text-white truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleProfileOptionClick('/profile')}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </button>
                      <button 
                        onClick={() => handleProfileOptionClick('/settings')}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings
                      </button>
                      <div className="border-t border-white/10"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full font-medium text-sm tracking-wide transition-all duration-300 transform hover:scale-105 border border-white/10 backdrop-blur-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white focus-ring rounded-full p-1"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden fixed inset-x-0 bg-black/20 backdrop-blur-lg min-h-screen z-40 transition-all duration-300 ease-in-out',
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          )}
        >
          <div className="container mx-auto px-6 pt-20 pb-6 flex flex-col items-center space-y-6">
            <Link
              to="/"
              className={cn(
                "text-white hover:text-white font-medium text-lg tracking-wide transition-colors duration-200 focus-ring rounded-md px-2 py-1 flex items-center gap-2",
                isActive("/") ? "text-white" : "text-white/70 hover:text-white"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link
              to="/training"
              className={cn(
                "text-white hover:text-white font-medium text-lg tracking-wide transition-colors duration-200 focus-ring rounded-md px-2 py-1 flex items-center gap-2",
                isActive("/training") ? "text-white" : "text-white/70 hover:text-white"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Dumbbell className="h-5 w-5" />
              Training
            </Link>
            <Link
              to="/teams"
              className={cn(
                "text-white hover:text-white font-medium text-lg tracking-wide transition-colors duration-200 focus-ring rounded-md px-2 py-1 flex items-center gap-2",
                isActive("/teams") ? "text-white" : "text-white/70 hover:text-white"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="h-5 w-5" />
              Teams
            </Link>
            <Link
              to="/gear-hub"
              className={cn(
                "text-white hover:text-white font-medium text-lg tracking-wide transition-colors duration-200 focus-ring rounded-md px-2 py-1 flex items-center gap-2",
                isActive("/gear-hub") ? "text-white" : "text-white/70 hover:text-white"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingBag className="h-5 w-5" />
              Gear Hub
            </Link>
            
            {/* Add notification button in mobile menu as well */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setIsMobileMenuOpen(false);
                }}
                className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 w-full justify-center py-3 rounded-lg text-white font-medium"
              >
                <Bell className="h-5 w-5" />
                Notifications
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute right-1/4">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={handlePremiumClick}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 w-full justify-center text-lg font-medium"
            >
              <Crown className="h-5 w-5" />
              Premium
            </button>
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 overflow-hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {renderUserAvatar('lg')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-8 py-3 rounded-full font-medium text-lg tracking-wide transition-all duration-200 w-full text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-medium text-lg tracking-wide transition-all duration-200 transform hover:scale-105 border border-white/10 backdrop-blur-sm w-full text-center"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>
      <PremiumDialog isOpen={isPremiumDialogOpen} onClose={() => setIsPremiumDialogOpen(false)} />
    </>
  );
};

export default Navbar;

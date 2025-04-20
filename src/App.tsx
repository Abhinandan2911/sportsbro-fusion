import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProfileCompletionDialog from "@/components/ProfileCompletionDialog";
import BackendStatusChecker from "@/components/BackendStatusChecker";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";
import Index from "./pages/Index";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import NotFound from "./pages/NotFound";
import Training from './pages/Training';
import GearHub from './pages/GearHub';
import Profile from './pages/Profile';
import AuthCallback from "./pages/AuthCallback";
import Welcome from "./pages/Welcome";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetail from "./pages/AdminUserDetail";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import api from "@/services/api";
import ProductForm from "./pages/ProductForm";
import authService from './services/authService';
import AdminDebug from "./pages/AdminDebug";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry failed queries once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  },
});

// Function to purge profile popup state on any page load
function purgeProfilePopupState() {
  // If there's a user in localStorage, ensure they're not considered a first-time user
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.isFirstLogin) {
        user.isFirstLogin = false;
        localStorage.setItem('user', JSON.stringify(user));
        console.log("App mounted: forced isFirstLogin to false for returning user");
      }
    }
    
    // Always set this to prevent popup for existing sessions
    localStorage.setItem('profileCompletionDismissed', 'true');
  } catch (err) {
    console.error("Error purging profile popup state:", err);
  }
}

// NavigationGuard component to preserve auth state during navigation
const NavigationGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  useEffect(() => {
    console.log('NavigationGuard checking authentication state at path:', location.pathname);
    
    // Skip auth check for public routes
    if (
      location.pathname === '/' || 
      location.pathname === '/login' || 
      location.pathname === '/auth-callback' || 
      location.pathname === '/welcome' ||
      location.pathname.startsWith('/admin')
    ) {
      return;
    }
    
    // For protected routes, ensure auth state is consistent
    const hasToken = !!localStorage.getItem('authToken');
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const hasUserData = !!localStorage.getItem('userProfile') || !!localStorage.getItem('user');
    
    console.log('Auth state check:', { hasToken, storedIsLoggedIn, isLoggedIn, hasUserData });
    
    // If we have issues with authentication state, try to recover
    if (!isLoggedIn && (hasToken || (storedIsLoggedIn && hasUserData))) {
      console.log('Found authentication data but not logged in context, fixing state');
      localStorage.setItem('isLoggedIn', 'true');
      
      // Force reload the page to refresh the auth context if needed
      if (location.pathname === '/profile' || location.pathname === '/dashboard') {
        window.location.reload();
      }
    }
    
    // If we're on a protected route but have no authentication, redirect to login
    if (!isLoggedIn && !hasToken && !storedIsLoggedIn && !location.pathname.includes('/login')) {
      console.log('No authentication found, redirecting to login');
      navigate('/login');
    }
  }, [location.pathname, isLoggedIn, user, navigate]);
  
  return <>{children}</>;
};

// Admin Route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = api.admin.isAdmin();
  
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn, user, shouldShowProfileCompletion } = useAuth();
  const location = useLocation();
  
  // Run the purge function on every location change
  useEffect(() => {
    console.log("Location changed to:", location.pathname);
    // If this isn't the first login page or auth callback, purge popup state
    if (location.pathname !== '/auth-callback' && location.pathname !== '/welcome') {
      purgeProfilePopupState();
    }
  }, [location]);
  
  // Also run on initial mount
  useEffect(() => {
    purgeProfilePopupState();
  }, []);
  
  // Determine if we should show the profile completion dialog
  // Only show for first-time users with incomplete profiles
  const showProfileDialog = isLoggedIn && shouldShowProfileCompletion && user?.isFirstLogin === true && user?.isProfileComplete === false;
  
  console.log('AppRoutes render - profile dialog visibility:', {
    isLoggedIn,
    shouldShowProfileCompletion,
    isFirstLogin: user?.isFirstLogin,
    isProfileComplete: user?.isProfileComplete,
    willShowDialog: showProfileDialog
  });

  return (
    <NavigationGuard>
      {showProfileDialog && <ProfileCompletionDialog />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/team/:id" element={<TeamDetail />} />
        <Route path="/training" element={<Training />} />
        <Route path="/gear-hub" element={<GearHub />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-profile" 
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={<AdminLogin />}
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/user/:id" 
          element={
            <AdminRoute>
              <AdminUserDetail />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/products/new" 
          element={
            <AdminRoute>
              <ProductForm />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/products/:id" 
          element={
            <AdminRoute>
              <ProductForm />
            </AdminRoute>
          } 
        />
        <Route
          path="/admin/debug"
          element={<AdminDebug />}
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Backend Status Checker - Only in development mode */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <BackendStatusChecker />
        </div>
      )}
    </NavigationGuard>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

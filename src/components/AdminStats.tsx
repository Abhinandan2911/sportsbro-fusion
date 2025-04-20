import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, UsersRound, Package, Star, TrendingUp } from 'lucide-react';
import { handleApiError } from '@/services/errorHandler';

interface Stats {
  totalUsers: number;
  recentUsers: number;
  authProviders: {
    google: number;
    local: number;
  };
  profileCompletion: {
    withPhoto: number;
    withSports: number;
    withAchievements: number;
  };
  productStats: {
    totalProducts: number;
    totalStock: number;
    avgRating: number;
  } | null;
}

const AdminStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.admin.getStats();
        
        if (response.success) {
          setStats(response.data);
        } else {
          handleApiError({ message: 'Failed to load statistics' }, 'Error');
        }
      } catch (error) {
        handleApiError(error, 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
        Unable to load statistics. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4 text-amber-400">📊 Platform Statistics</h2>
      
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-sm bg-black/40 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-amber-400">
              <UsersRound className="w-5 h-5 mr-2" /> 
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
            <p className="text-sm text-white/70 mt-1">
              {stats.recentUsers} new in the last 30 days
            </p>
          </CardContent>
        </Card>

        {stats.productStats && (
          <Card className="backdrop-blur-sm bg-black/40 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-amber-400">
                <Package className="w-5 h-5 mr-2" /> 
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.productStats.totalProducts}</div>
              <p className="text-sm text-white/70 mt-1">
                {stats.productStats.totalStock} items in stock
              </p>
            </CardContent>
          </Card>
        )}

        {stats.productStats && (
          <Card className="backdrop-blur-sm bg-black/40 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-amber-400">
                <Star className="w-5 h-5 mr-2" /> 
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.productStats.avgRating}</div>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(parseFloat(stats.productStats!.avgRating)) 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-gray-600'}`} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="backdrop-blur-sm bg-black/40 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-amber-400">
              <TrendingUp className="w-5 h-5 mr-2" /> 
              Auth Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Standard</span>
                <span className="text-white font-semibold">{stats.authProviders.local}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ width: `${(stats.authProviders.local / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Google</span>
                <span className="text-white font-semibold">{stats.authProviders.google}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.authProviders.google / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Stats */}
      <Card className="backdrop-blur-sm bg-black/40 border border-white/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-400">
            <BarChart className="w-5 h-5 mr-2" /> 
            Profile Completion Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-white/70">Users with Profile Photo</span>
                <span className="text-sm text-white/90 font-medium">
                  {Math.round((stats.profileCompletion.withPhoto / stats.totalUsers) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.profileCompletion.withPhoto / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-white/70">Users with Sports Listed</span>
                <span className="text-sm text-white/90 font-medium">
                  {Math.round((stats.profileCompletion.withSports / stats.totalUsers) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.profileCompletion.withSports / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-white/70">Users with Achievements</span>
                <span className="text-sm text-white/90 font-medium">
                  {Math.round((stats.profileCompletion.withAchievements / stats.totalUsers) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ width: `${(stats.profileCompletion.withAchievements / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats; 
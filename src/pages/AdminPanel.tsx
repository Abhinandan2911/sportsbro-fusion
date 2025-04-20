import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  authProvider: string;
  googleId?: string;
  profilePhoto?: string;
  sports?: string[];
  createdAt: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string>('');

  const fetchUsers = async () => {
    if (!adminToken) {
      setError('Admin token is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/admin/users?token=${adminToken}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8 text-amber-400">Admin Dashboard</h1>
        
        <Card className="mb-8 backdrop-blur-sm bg-black/40 border border-white/20 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
          <CardHeader>
            <CardTitle className="text-amber-400">Admin Authentication</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your admin token to access user data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="adminToken" className="text-white/90">Admin Token</Label>
                <Input 
                  id="adminToken" 
                  placeholder="Enter admin token" 
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  className="bg-transparent border border-white/30 text-white placeholder:text-white/40 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10 transition-shadow duration-300 focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/50 focus:bg-transparent hover:bg-transparent"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={fetchUsers} 
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Fetch Users'
              )}
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm mb-6">
            {error}
          </div>
        )}

        {users.length > 0 && (
          <Card className="backdrop-blur-sm bg-black/40 border border-white/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <CardHeader>
              <CardTitle className="text-amber-400">Users ({users.length})</CardTitle>
              <CardDescription className="text-gray-400">
                Viewing all registered users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-black/60 border-b border-white/10">
                      <th className="px-4 py-3 text-left text-white/80">Name</th>
                      <th className="px-4 py-3 text-left text-white/80">Username</th>
                      <th className="px-4 py-3 text-left text-white/80">Email</th>
                      <th className="px-4 py-3 text-left text-white/80">Auth Provider</th>
                      <th className="px-4 py-3 text-left text-white/80">Google ID</th>
                      <th className="px-4 py-3 text-left text-white/80">Sports</th>
                      <th className="px-4 py-3 text-left text-white/80">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {user.profilePhoto ? (
                              <img 
                                src={user.profilePhoto} 
                                alt={user.fullName} 
                                className="w-8 h-8 rounded-full mr-3 object-cover border border-amber-500/30"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full mr-3 bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {user.fullName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            )}
                            <span className="text-white/90">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/70">{user.username}</td>
                        <td className="px-4 py-3 text-white/70">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.authProvider === 'google' 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {user.authProvider}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/50 text-sm">{user.googleId || '-'}</td>
                        <td className="px-4 py-3">
                          {user.sports && user.sports.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.sports.map(sport => (
                                <span key={sport} className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                                  {sport}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/70">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 
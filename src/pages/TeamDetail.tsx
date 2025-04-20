import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, UserPlus, Users, MessageCircle, Calendar, Award, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { handleApiError, showSuccess } from '@/services/errorHandler';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import centralTeamStore from '@/services/centralTeamStore';
import teamService from '@/services/teamService';

// Define the Team interface to match the API response
interface TeamMember {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
  profilePhoto?: string;
}

interface JoinRequest {
  _id: string;
  userId: string;
  username?: string;
  requestedAt: string;
}

interface Team {
  _id: string;
  name: string;
  sport: string;
  description: string;
  city: string;
  state: string;
  skillLevel: string;
  maxSize: number;
  members: TeamMember[];
  joinRequests: JoinRequest[];
  createdBy: {
    _id: string;
    username: string;
    fullName?: string;
    email?: string;
    profilePhoto?: string;
  };
  isCustomSport?: boolean;
  isCustomCity?: boolean;
  createdAt: string;
  updatedAt: string;
  imgUrl: string;
}

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch team details when id is available
    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await api.teams.getById(id as string);
      setTeam(response.data);
      
      // Check if current user has already requested to join
      if (user && response.data.joinRequests) {
        const hasRequested = response.data.joinRequests.some(
          (request: JoinRequest) => request.userId === user._id
        );
        setHasRequestedToJoin(hasRequested);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      await centralTeamStore.requestToJoin(team?._id as string, user);
      showSuccess('Join request sent successfully!');
      setHasRequestedToJoin(true);
    } catch (error) {
      handleApiError(error, 'Failed to send join request');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !team) {
      return;
    }

    try {
      setLeaving(true);
      await teamService.leaveTeam(team._id, user._id);
      showSuccess('You have left the team successfully');
      // Refresh team data or navigate back to teams list
      navigate('/teams');
    } catch (error) {
      handleApiError(error, 'Failed to leave the team');
    } finally {
      setLeaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <Navbar />
        <div className="container mx-auto py-20 px-4 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <Navbar />
        <div className="container mx-auto py-20 px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Team not found</h1>
          <Button onClick={() => navigate('/teams')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  const isTeamMember = user && team.members.some(member => member._id === user._id);
  const isTeamOwner = user && team.createdBy._id === user._id;

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <Button 
          onClick={() => navigate('/teams')} 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Team Info */}
          <div className="col-span-2">
            <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {/* Team Header Image */}
              <div 
                className="h-60 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${team.imgUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
                  <div className="flex items-center text-gray-300 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {team.city}, {team.state}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white/20">{team.sport}</Badge>
                    <Badge variant="secondary" className="bg-white/20">{team.skillLevel}</Badge>
                  </div>
                </div>
              </div>
              
              {/* Team Details */}
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <Info className="h-5 w-5 mr-2" /> About
                  </h2>
                  <p className="text-gray-300">{team.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#3a3a3a] p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                      <Users className="h-5 w-5 mr-2" /> Team Size
                    </h3>
                    <p className="text-gray-300">{team.members.length} / {team.maxSize} members</p>
                  </div>
                  
                  <div className="bg-[#3a3a3a] p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" /> Created
                    </h3>
                    <p className="text-gray-300">{new Date(team.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {!isTeamMember && !isTeamOwner && (
                  <Button 
                    onClick={handleJoinTeam}
                    disabled={hasRequestedToJoin || joining}
                    className="w-full bg-white text-black hover:bg-gray-100 mt-4"
                  >
                    {joining ? <Spinner size="sm" className="mr-2" /> : <UserPlus className="h-5 w-5 mr-2" />}
                    {hasRequestedToJoin ? 'Join Request Sent' : 'Request to Join Team'}
                  </Button>
                )}
                
                {isTeamMember && !isTeamOwner && (
                  <Button 
                    onClick={handleLeaveTeam}
                    disabled={leaving}
                    variant="destructive" 
                    className="w-full mt-4"
                  >
                    {leaving ? <Spinner size="sm" className="mr-2" /> : null}
                    Leave Team
                  </Button>
                )}
                
                {isTeamOwner && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                    onClick={() => navigate(`/team/manage/${team._id}`)}
                  >
                    Manage Team
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Team Members */}
          <div className="col-span-1">
            <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" /> Team Members
              </h2>
              
              <div className="space-y-4">
                {/* Team Owner */}
                <div className="flex items-center p-3 bg-[#3a3a3a] rounded-lg">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={team.createdBy.profilePhoto} />
                    <AvatarFallback>{getInitials(team.createdBy.fullName || team.createdBy.username)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{team.createdBy.fullName || team.createdBy.username}</p>
                    <Badge variant="outline" className="text-xs bg-yellow-600/30 text-yellow-400 border-yellow-600/50">Team Owner</Badge>
                  </div>
                </div>
                
                {/* Team Members (excluding owner) */}
                {team.members
                  .filter(member => member._id !== team.createdBy._id)
                  .map(member => (
                    <div key={member._id} className="flex items-center p-3 bg-[#3a3a3a] rounded-lg">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={member.profilePhoto} />
                        <AvatarFallback>{getInitials(member.fullName || member.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{member.fullName || member.username}</p>
                        <p className="text-xs text-gray-400">Member</p>
                      </div>
                    </div>
                  ))}
                
                {team.members.length <= 1 && (
                  <p className="text-gray-400 text-center py-2">No other members yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail; 